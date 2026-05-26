import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import { AssertRotationExistsQuery } from '../../../../operators/application/query/rotation/assert-rotation-exists.query';
import {
  FlightIncorrectStateToChangeRotationError,
  FlightNotFoundError,
  FlightRotationNotMatchingError,
} from '../../../model/error/flight.error';
import { FlightStatus } from '../../../model/flight.model';
import { NewFlightEvent } from '../../../infra/http/request/event.dto';
import { FlightEventType } from '../../../../../core/events/flight';
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
    private readonly eventEmitter: EventEmitter2,
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

    const event: NewFlightEvent = {
      flightId,
      rotationId,
      type: FlightEventType.FlightWasRemovedFromRotation,
      scope: FlightEventScope.Operations,
      actorId: initiatorId,
    };
    this.eventEmitter.emit(FlightEventType.FlightWasRemovedFromRotation, event);
  }
}
