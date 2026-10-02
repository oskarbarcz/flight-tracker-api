import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import {
  FlightNotAttachableError,
  LegLockedError,
  RotationLegNotFoundError,
  RotationNotActiveError,
  RotationNotFoundError,
} from '../../model/error/rotation.error';
import {
  acceptsFlightChanges,
  isFlightPreCheckIn,
} from '../../model/rotation.rules';

export class DetachFlightFromLegCommand {
  constructor(
    public readonly rotationId: string,
    public readonly legId: string,
    public readonly actorId: string,
  ) {}
}

@CommandHandler(DetachFlightFromLegCommand)
export class DetachFlightFromLegHandler implements ICommandHandler<DetachFlightFromLegCommand> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(command: DetachFlightFromLegCommand): Promise<void> {
    const { rotationId, legId } = command;

    const rotation = await this.repository.findById(rotationId);
    if (!rotation) {
      throw new RotationNotFoundError();
    }

    if (!acceptsFlightChanges(rotation.status)) {
      throw new RotationNotActiveError();
    }

    const leg = rotation.legs.find((candidate) => candidate.id === legId);
    if (!leg) {
      throw new RotationLegNotFoundError();
    }

    if (!leg.flight) {
      throw new FlightNotAttachableError('Leg has no attached flight.');
    }

    if (!isFlightPreCheckIn(leg.flight.status)) {
      throw new LegLockedError();
    }

    await this.repository.setLegFlight(
      rotationId,
      legId,
      null,
      command.actorId,
    );
  }
}
