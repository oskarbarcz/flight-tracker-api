import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { RotationStatus } from '../../model/rotation.model';
import {
  LegSetFrozenError,
  RotationLegNotFoundError,
  RotationNotFoundError,
} from '../../model/error/rotation.error';

export class RemoveLegCommand {
  constructor(
    public readonly rotationId: string,
    public readonly legId: string,
    public readonly actorId: string,
  ) {}
}

@CommandHandler(RemoveLegCommand)
export class RemoveLegHandler implements ICommandHandler<RemoveLegCommand> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(command: RemoveLegCommand): Promise<void> {
    const { rotationId, legId } = command;

    const rotation = await this.repository.findById(rotationId);
    if (!rotation) {
      throw new RotationNotFoundError();
    }

    const leg = rotation.legs.find((candidate) => candidate.id === legId);
    if (!leg) {
      throw new RotationLegNotFoundError();
    }

    if (rotation.status !== RotationStatus.Draft) {
      throw new LegSetFrozenError();
    }

    await this.repository.removeLeg(rotationId, legId, command.actorId);
  }
}
