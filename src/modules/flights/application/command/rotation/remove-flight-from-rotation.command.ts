import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import { AssertRotationExistsQuery } from '../../../../operators/application/assert/assert-rotation-exists.query';
import {
  FlightIncorrectStateToChangeRotationError,
  FlightNotFoundError,
  FlightRotationNotMatchingError,
} from '../../../model/error/flight.error';
import { FlightStatus } from '../../../model/flight.model';
import { FlightWasRemovedFromRotationEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';

export class RemoveFlightFromRotationCommand {
  constructor(
    public readonly flightId: string,
    public readonly rotationId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(RemoveFlightFromRotationCommand)
export class RemoveFlightFromRotationHandler implements ICommandHandler<RemoveFlightFromRotationCommand> {
  constructor(
    private readonly repository: FlightsRepository,
    private readonly queryBus: QueryBus,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: RemoveFlightFromRotationCommand): Promise<void> {
    const { flightId, rotationId, initiatorId } = command;

    const flight = await this.repository.findOneBy({ id: flightId });
    if (!flight) throw new FlightNotFoundError();

    await this.queryBus.execute(new AssertRotationExistsQuery(rotationId));

    if (flight.rotationId !== rotationId) {
      throw new FlightRotationNotMatchingError();
    }

    if (flight.status !== FlightStatus.Created) {
      throw new FlightIncorrectStateToChangeRotationError();
    }

    await this.repository.removeRotationForFlight(
      command.flightId,
      command.rotationId,
    );

    this.domainEvents.emit(
      new FlightWasRemovedFromRotationEvent({
        flightId,
        rotationId,
        scope: FlightEventScope.Operations,
        actorId: initiatorId,
      }),
    );
  }
}
