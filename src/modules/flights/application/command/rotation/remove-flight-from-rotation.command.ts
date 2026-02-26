import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import { AssertRotationExistsQuery } from '../../../../operators/application/query/rotation/assert-rotation-exists.query';
import {
  FlightIncorrectStateToChangeRotationError,
  FlightNotFoundError,
  FlightRotationNotMatchingError,
} from '../../../model/error/flight.error';
import { FlightStatus } from '../../../model/flight.entity';

export class RemoveFlightFromRotationCommand {
  constructor(
    public readonly flightId: string,
    public readonly rotationId: string,
  ) {}
}

@CommandHandler(RemoveFlightFromRotationCommand)
export class RemoveFlightToRotationHandler implements ICommandHandler<RemoveFlightFromRotationCommand> {
  constructor(
    private readonly repository: FlightsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: RemoveFlightFromRotationCommand): Promise<void> {
    const { flightId, rotationId } = command;

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
  }
}
