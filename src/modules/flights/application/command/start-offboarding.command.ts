import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  FlightDoesNotExistError,
  InvalidStatusToStartOffboardingError,
} from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { OffboardingWasStartedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { GetUserGsxSettingsQuery } from '../../../users/application/query/get-user-gsx-settings.query';
import { resolveGroundServiceSource } from '../../model/ground-service-source';

export class StartOffboardingCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
    public readonly requestedByGsx: boolean = false,
  ) {}
}

@CommandHandler(StartOffboardingCommand)
export class StartOffboardingHandler implements ICommandHandler<StartOffboardingCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: StartOffboardingCommand): Promise<void> {
    const { flightId, initiatorId, requestedByGsx } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.OnBlock) {
      throw new InvalidStatusToStartOffboardingError();
    }

    const settingsQuery = new GetUserGsxSettingsQuery(initiatorId);
    const settings = await this.queryBus.execute(settingsQuery);
    const source = resolveGroundServiceSource(
      requestedByGsx,
      settings.integrationEnabled && settings.autoDeboardingEnabled,
    );

    await this.flightsRepository.updateStatus(
      flightId,
      FlightStatus.OffboardingStarted,
    );

    await this.domainEvents.emitAsync(
      new OffboardingWasStartedEvent({
        flightId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
        payload: { source },
      }),
    );
  }
}
