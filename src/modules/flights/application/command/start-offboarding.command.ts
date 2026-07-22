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

export class StartOffboardingCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
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
    const { flightId, initiatorId } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (flight.status !== FlightStatus.OnBlock) {
      throw new InvalidStatusToStartOffboardingError();
    }

    await this.flightsRepository.updateStatus(
      flightId,
      FlightStatus.OffboardingStarted,
    );

    this.domainEvents.emit(
      new OffboardingWasStartedEvent({
        flightId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
      }),
    );
  }
}
