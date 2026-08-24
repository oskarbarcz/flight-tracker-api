import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  InvalidStatusToMarkAsReadyError,
  PreliminaryLoadsheetMissingError,
} from '../../model/error/flight.error';
import { FlightWasReleasedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { GenerateFlightManifestCommand } from '../../../passengers/application/command/generate-flight-manifest.command';
import { GenerateFlightCargoManifestCommand } from '../../../cargo/application/command/generate-flight-cargo-manifest.command';
import { AirportType } from '../../../airports/model/airport.model';
import { scheduledFlightHours } from '../../model/timesheet.model';

export class MarkAsReadyCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(MarkAsReadyCommand)
export class MarkFlightAsReadyHandler implements ICommandHandler<MarkAsReadyCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: MarkAsReadyCommand): Promise<void> {
    const { flightId, initiatorId } = command;

    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (flight.status !== FlightStatus.Created) {
      throw new InvalidStatusToMarkAsReadyError();
    }

    if (!flight.loadsheets.preliminary) {
      throw new PreliminaryLoadsheetMissingError();
    }

    const generateManifest = new GenerateFlightManifestCommand(
      flightId,
      flight.aircraft.id,
      flight.operator.id,
      flight.loadsheets.preliminary.passengers,
      flight.loadsheets.preliminary.passengersByCabin,
    );
    await this.commandBus.execute(generateManifest);

    const departure = flight.airports.find(
      (airport) => airport.type === AirportType.Departure,
    );
    const arrival = flight.airports.find(
      (airport) => airport.type === AirportType.Destination,
    );

    if (departure && arrival) {
      const generateCargoManifest = new GenerateFlightCargoManifestCommand(
        flightId,
        flight.aircraft.id,
        flight.operator.iataCode,
        flight.loadsheets.preliminary.cargo,
        flight.loadsheets.preliminary.passengers,
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
      );
      await this.commandBus.execute(generateCargoManifest);
    }

    await this.flightsRepository.updateStatus(flightId, FlightStatus.Ready);
    await this.domainEvents.emitAsync(
      new FlightWasReleasedEvent({
        flightId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
      }),
    );
  }
}
