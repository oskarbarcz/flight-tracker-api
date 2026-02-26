import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';
import {
  FlightAlreadyAssignedToRotationError,
  FlightIncorrectStateToAddToRotationError,
  FlightNotFoundError,
} from '../../../model/error/flight.error';
import { FlightStatus } from '../../../model/flight.entity';

export class AddFlightToRotationCommand {
  constructor(
    public readonly flightId: string,
    public readonly rotationId: string,
  ) {}
}

@CommandHandler(AddFlightToRotationCommand)
export class AddFlightToRotationHandler implements ICommandHandler<AddFlightToRotationCommand> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(command: AddFlightToRotationCommand): Promise<void> {
    const { flightId, rotationId } = command;

    const flight = await this.repository.findOneBy({ id: flightId });

    if (!flight) throw new FlightNotFoundError();
    if (flight.rotationId) throw new FlightAlreadyAssignedToRotationError();
    if (flight.status !== FlightStatus.Created) {
      throw new FlightIncorrectStateToAddToRotationError();
    }

    await this.repository.addRotationForFlight(flightId, rotationId);
  }
}
