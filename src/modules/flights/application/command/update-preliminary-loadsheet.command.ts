import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  FlightDoesNotExistError,
  InvalidStatusToUpdateLoadsheetError,
} from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { Loadsheet, Loadsheets } from '../../model/loadsheet.model';
import { PreliminaryLoadsheetWasUpdatedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import {
  assertFuelBreakdownConsistent,
  assertPassengerBreakdownConsistent,
  assertPayloadAccountsForLoad,
} from '../../model/loadsheet.policy';
import { GetSeatCapacityQuery } from '../../../manifest/application/query/get-seat-capacity.query';
import { SeatCapacityExceededError } from '../../../manifest/model/error/manifest.error';
import { assertBreakdownFitsCabins } from '../../../manifest/model/manifest-generation';
import { CabinCapacity } from '../../../cabin-layouts/model/cabin-capacity.model';
import { GenerateFlightManifestCommand } from '../../../manifest/application/command/generate-flight-manifest.command';
import { GenerateFlightCargoManifestCommand } from '../../../manifest/application/command/generate-flight-cargo-manifest.command';
import { IssueNotocCommand } from '../../../manifest/application/command/issue-notoc.command';
import { NotocStageName } from '../../../manifest/model/notoc.model';
import { AirportType } from '../../../airports/model/airport.model';
import { scheduledFlightHours } from '../../model/timesheet.model';
import { GetFlightResponse } from '../../infra/http/request/flight.dto';

export class UpdatePreliminaryLoadsheetCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly loadsheet: Loadsheet,
  ) {}
}

@CommandHandler(UpdatePreliminaryLoadsheetCommand)
export class UpdatePreliminaryLoadsheetHandler implements ICommandHandler<UpdatePreliminaryLoadsheetCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdatePreliminaryLoadsheetCommand): Promise<void> {
    const { flightId, initiatorId, loadsheet } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.Created) {
      throw new InvalidStatusToUpdateLoadsheetError();
    }

    assertFuelBreakdownConsistent(loadsheet);
    assertPassengerBreakdownConsistent(loadsheet);
    assertPayloadAccountsForLoad(loadsheet);

    const capacityQuery = new GetSeatCapacityQuery(flight.aircraft.id);
    const capacity: CabinCapacity | null =
      await this.queryBus.execute(capacityQuery);

    if (capacity) {
      if (loadsheet.passengers > capacity.totalSeats) {
        throw new SeatCapacityExceededError(
          loadsheet.passengers,
          capacity.totalSeats,
        );
      }

      if (loadsheet.passengersByCabin) {
        assertBreakdownFitsCabins(
          capacity.cabinSizes,
          loadsheet.passengersByCabin,
        );
      }
    }

    await this.regenerateManifests(flight, loadsheet);

    const loadsheets: Loadsheets = {
      preliminary: loadsheet,
      final: flight.loadsheets.final,
    };
    await this.flightsRepository.updateLoadsheets(flightId, loadsheets);
    await this.domainEvents.emitAsync(
      new PreliminaryLoadsheetWasUpdatedEvent({
        flightId,
        scope: FlightEventScope.Operations,
        actorId: initiatorId,
      }),
    );
  }

  private async regenerateManifests(
    flight: GetFlightResponse,
    loadsheet: Loadsheet,
  ): Promise<void> {
    const generateManifest = new GenerateFlightManifestCommand(
      flight.id,
      flight.aircraft.id,
      flight.operator.id,
      loadsheet.passengers,
      loadsheet.passengersByCabin,
    );
    await this.commandBus.execute(generateManifest);

    const departure = flight.airports.find(
      (airport) => airport.type === AirportType.Departure,
    );
    const arrival = flight.airports.find(
      (airport) => airport.type === AirportType.Destination,
    );

    if (!departure || !arrival) {
      return;
    }

    const generateCargoManifest = new GenerateFlightCargoManifestCommand(
      flight.id,
      flight.aircraft.id,
      flight.operator.iataCode,
      loadsheet.cargo,
      loadsheet.passengers,
      {
        iataCode: departure.iataCode,
        country: departure.country,
        continent: departure.continent,
      },
      {
        iataCode: arrival.iataCode,
        country: arrival.country,
        continent: arrival.continent,
      },
      flight.timesheet.scheduled?.offBlockTime
        ? new Date(flight.timesheet.scheduled.offBlockTime)
        : new Date(),
      scheduledFlightHours(flight.timesheet.scheduled),
      loadsheet.payload,
      loadsheet.passengersByCabin ?? null,
    );
    await this.commandBus.execute(generateCargoManifest);

    const issueNotoc = new IssueNotocCommand(
      flight.id,
      NotocStageName.Preliminary,
      arrival.iataCode,
      new Date(),
    );
    await this.commandBus.execute(issueNotoc);
  }
}
