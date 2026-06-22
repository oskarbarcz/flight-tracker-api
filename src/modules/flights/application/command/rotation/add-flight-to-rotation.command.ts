import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import {
  FlightAlreadyAssignedToRotationError,
  FlightIncorrectStateToChangeRotationError,
  FlightNotFoundError,
} from '../../../model/error/flight.error';
import { FlightStatus } from '../../../model/flight.model';
import { AssertRotationExistsQuery } from '../../../../operators/application/query/rotation/assert-rotation-exists.query';
import { FlightWasAddedToRotationEvent } from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventScope } from '../../../model/event.model';

export class AddFlightToRotationCommand {
  constructor(
    public readonly flightId: string,
    public readonly rotationId: string,
    public readonly initiatorId: string,
  ) {}
}

@CommandHandler(AddFlightToRotationCommand)
export class AddFlightToRotationHandler implements ICommandHandler<AddFlightToRotationCommand> {
  constructor(
    private readonly repository: FlightsRepository,
    private readonly queryBus: QueryBus,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: AddFlightToRotationCommand): Promise<void> {
    const { flightId, rotationId, initiatorId } = command;

    const flight = await this.repository.findOneBy({ id: flightId });

    if (!flight) throw new FlightNotFoundError();
    if (flight.rotationId) throw new FlightAlreadyAssignedToRotationError();
    if (flight.status !== FlightStatus.Created) {
      throw new FlightIncorrectStateToChangeRotationError();
    }

    await this.queryBus.execute(new AssertRotationExistsQuery(rotationId));
    await this.repository.addRotationForFlight(flightId, rotationId);

    this.domainEvents.emit(
      new FlightWasAddedToRotationEvent({
        flightId,
        rotationId,
        scope: FlightEventScope.Operations,
        actorId: initiatorId,
      }),
    );
  }
}
