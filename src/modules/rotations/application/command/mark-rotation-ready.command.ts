import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { RotationStatus } from '../../model/rotation.model';
import {
  RotationNotFoundError,
  RotationNotReadyableError,
} from '../../model/error/rotation.error';
import {
  assertChainContinuous,
  assertLegValid,
  LegShape,
} from '../../model/rotation.rules';

export class MarkRotationReadyCommand {
  constructor(
    public readonly rotationId: string,
    public readonly actorId: string,
  ) {}
}

@CommandHandler(MarkRotationReadyCommand)
export class MarkRotationReadyHandler implements ICommandHandler<MarkRotationReadyCommand> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(command: MarkRotationReadyCommand): Promise<void> {
    const rotation = await this.repository.findById(command.rotationId);
    if (!rotation) {
      throw new RotationNotFoundError();
    }

    if (rotation.status !== RotationStatus.Draft) {
      throw new RotationNotReadyableError(
        'Only a draft rotation can be marked ready.',
      );
    }

    if (rotation.legs.length < 2) {
      throw new RotationNotReadyableError(
        'A rotation must have at least two legs to be marked ready.',
      );
    }

    const shapes = rotation.legs.map(
      (leg): LegShape => ({
        departureId: leg.departure.id,
        arrivalId: leg.arrival.id,
        offBlockTime: leg.offBlockTime,
        onBlockTime: leg.onBlockTime,
      }),
    );

    shapes.forEach((shape) => assertLegValid(shape));
    assertChainContinuous(shapes);

    await this.repository.updateStatus(
      command.rotationId,
      RotationStatus.Ready,
      command.actorId,
    );
  }
}
