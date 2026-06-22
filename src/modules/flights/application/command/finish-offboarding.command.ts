import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightStatus } from '../../model/flight.model';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FlightDoesNotExistError,
  InvalidStatusToFinishOffboardingError,
} from '../../infra/http/request/errors.dto';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { OffboardingWasFinishedEvent } from '../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../model/event.model';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';

export class FinishOffboardingCommand {
  constructor(
    public readonly flightId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(FinishOffboardingCommand)
export class FinishOffboardingHandler implements ICommandHandler<FinishOffboardingCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: FinishOffboardingCommand): Promise<void> {
    const { flightId, initiatorId } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new NotFoundException(FlightDoesNotExistError);
    }

    if (flight.status !== FlightStatus.OffboardingStarted) {
      throw new UnprocessableEntityException(
        InvalidStatusToFinishOffboardingError,
      );
    }

    await this.flightsRepository.updateStatus(
      flightId,
      FlightStatus.OffboardingFinished,
    );

    this.domainEvents.emit(
      new OffboardingWasFinishedEvent({
        flightId,
        rotationId: flight.rotationId,
        scope: FlightEventScope.User,
        actorId: initiatorId,
      }),
    );
  }
}
