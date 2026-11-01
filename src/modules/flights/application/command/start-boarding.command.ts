import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  FlightDoesNotExistError,
  InvalidStatusToStartBoardingError,
} from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { BoardingWasStartedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { GetUserGsxSettingsQuery } from '../../../users/application/query/get-user-gsx-settings.query';
import { resolveGroundServiceSource } from '../../model/ground-service-source';

export class StartBoardingCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly requestedByGsx: boolean = false,
  ) {}
}

@CommandHandler(StartBoardingCommand)
export class StartBoardingHandler implements ICommandHandler<StartBoardingCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: StartBoardingCommand): Promise<void> {
    const { flightId, initiatorId, requestedByGsx } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.CheckedIn) {
      throw new InvalidStatusToStartBoardingError();
    }

    const settingsQuery = new GetUserGsxSettingsQuery(initiatorId);
    const settings = await this.queryBus.execute(settingsQuery);
    const source = resolveGroundServiceSource(
      requestedByGsx,
      settings.integrationEnabled && settings.autoBoardingEnabled,
    );

    await this.flightsRepository.updateStatus(
      flightId,
      FlightStatus.BoardingStarted,
    );
    this.domainEvents.emit(
      new BoardingWasStartedEvent({
        flightId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
        payload: { source },
      }),
    );
  }
}
