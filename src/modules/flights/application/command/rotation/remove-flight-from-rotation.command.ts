import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';

export class RemoveFlightFromRotationCommand {
  constructor(
    public readonly rotationId: string,
    public readonly flightId: string,
  ) {}
}

@CommandHandler(RemoveFlightFromRotationCommand)
export class RemoveFlightToRotationHandler implements ICommandHandler<RemoveFlightFromRotationCommand> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(command: RemoveFlightFromRotationCommand): Promise<void> {
    await this.repository.removeRotationForFlight(
      command.flightId,
      command.rotationId,
    );
  }
}
