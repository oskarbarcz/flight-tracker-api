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
  InvalidStatusToFinishBoardingError,
} from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { BoardingWasFinishedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { Loadsheet } from '../../model/loadsheet.model';
import {
  assertFuelBreakdownConsistent,
  assertPassengerBreakdownConsistent,
  assertPayloadAccountsForLoad,
} from '../../model/loadsheet.policy';
import { ReconcileFlightManifestCommand } from '../../../manifest/application/command/reconcile-flight-manifest.command';
import { ReconcileFlightCargoManifestCommand } from '../../../manifest/application/command/reconcile-flight-cargo-manifest.command';
import { AirportType } from '../../../airports/model/airport.model';
import { scheduledFlightHours } from '../../model/timesheet.model';
import { IssueNotocCommand } from '../../../manifest/application/command/issue-notoc.command';
import { AcknowledgeNotocCommand } from '../../../manifest/application/command/acknowledge-notoc.command';
import { NotocStageName } from '../../../manifest/model/notoc.model';

export class FinishBoardingCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly finalLoadsheet: Loadsheet,
  ) {}
}

@CommandHandler(FinishBoardingCommand)
export class FinishBoardingHandler implements ICommandHandler<FinishBoardingCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: FinishBoardingCommand): Promise<void> {
    const { flightId, initiatorId, finalLoadsheet } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.BoardingStarted) {
      throw new InvalidStatusToFinishBoardingError();
    }

    assertFuelBreakdownConsistent(finalLoadsheet);
    assertPassengerBreakdownConsistent(finalLoadsheet);
    assertPayloadAccountsForLoad(finalLoadsheet);

    const reconcileManifest = new ReconcileFlightManifestCommand(
      flightId,
      finalLoadsheet.passengers,
      finalLoadsheet.passengersByCabin,
    );
    await this.commandBus.execute(reconcileManifest);

    const departure = flight.airports.find(
      (airport) => airport.type === AirportType.Departure,
    );
    const arrival = flight.airports.find(
      (airport) => airport.type === AirportType.Destination,
    );

    if (departure && arrival) {
      const reconcileCargoManifest = new ReconcileFlightCargoManifestCommand(
        flightId,
        flight.aircraft.id,
        flight.operator.iataCode,
        finalLoadsheet.cargo,
        finalLoadsheet.passengers,
        {
          iataCode: departure.iataCode,
          country: departure.country.code,
          continent: departure.continent,
        },
        {
          iataCode: arrival.iataCode,
          country: arrival.country.code,
          continent: arrival.continent,
        },
        flight.timesheet.scheduled?.offBlockTime
          ? new Date(flight.timesheet.scheduled.offBlockTime)
          : new Date(),
        scheduledFlightHours(flight.timesheet.scheduled),
      );
      await this.commandBus.execute(reconcileCargoManifest);

      const issuedAt = new Date();
      const issueNotoc = new IssueNotocCommand(
        flightId,
        NotocStageName.Final,
        arrival.iataCode,
        issuedAt,
      );
      await this.commandBus.execute(issueNotoc);

      const acknowledgeNotoc = new AcknowledgeNotocCommand(
        flightId,
        NotocStageName.Final,
        initiatorId,
        issuedAt,
      );
      await this.commandBus.execute(acknowledgeNotoc);
    }

    await Promise.all([
      await this.flightsRepository.updateLoadsheets(flightId, {
        preliminary: flight.loadsheets.preliminary,
        final: finalLoadsheet,
      }),
      await this.flightsRepository.updateStatus(
        flightId,
        FlightStatus.BoardingFinished,
      ),
    ]);

    this.domainEvents.emit(
      new BoardingWasFinishedEvent({
        flightId: flightId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
      }),
    );
  }
}
