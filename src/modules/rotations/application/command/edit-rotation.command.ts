import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { RotationStatus } from '../../model/rotation.model';
import {
  RotationNotEditableError,
  RotationNotFoundError,
} from '../../model/error/rotation.error';

export class EditRotationCommand {
  constructor(
    public readonly rotationId: string,
    public readonly name: string,
    public readonly pilotId: string,
    public readonly actorId: string,
  ) {}
}

@CommandHandler(EditRotationCommand)
export class EditRotationHandler implements ICommandHandler<EditRotationCommand> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(command: EditRotationCommand): Promise<void> {
    const rotation = await this.repository.findById(command.rotationId);
    if (!rotation) {
      throw new RotationNotFoundError();
    }

    if (rotation.status !== RotationStatus.Draft) {
      throw new RotationNotEditableError();
    }

    await this.repository.update(
      command.rotationId,
      command.name,
      command.pilotId,
      command.actorId,
    );
  }
}
