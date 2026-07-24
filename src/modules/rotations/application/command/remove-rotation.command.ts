import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { RotationStatus } from '../../model/rotation.model';
import {
  RotationNotDeletableError,
  RotationNotFoundError,
} from '../../model/error/rotation.error';

export class RemoveRotationCommand {
  constructor(public readonly rotationId: string) {}
}

@CommandHandler(RemoveRotationCommand)
export class RemoveRotationHandler implements ICommandHandler<RemoveRotationCommand> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(command: RemoveRotationCommand): Promise<void> {
    const rotation = await this.repository.findById(command.rotationId);
    if (!rotation) {
      throw new RotationNotFoundError();
    }

    if (rotation.status !== RotationStatus.Draft) {
      throw new RotationNotDeletableError();
    }

    await this.repository.delete(command.rotationId);
  }
}
