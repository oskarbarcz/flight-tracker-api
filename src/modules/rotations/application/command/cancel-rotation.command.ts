import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { RotationStatus } from '../../model/rotation.model';
import {
  RotationNotCancelableError,
  RotationNotFoundError,
} from '../../model/error/rotation.error';

export class CancelRotationCommand {
  constructor(
    public readonly rotationId: string,
    public readonly actorId: string,
    public readonly reason: string | null,
  ) {}
}

@CommandHandler(CancelRotationCommand)
export class CancelRotationHandler implements ICommandHandler<CancelRotationCommand> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(command: CancelRotationCommand): Promise<void> {
    const rotation = await this.repository.findById(command.rotationId);
    if (!rotation) {
      throw new RotationNotFoundError();
    }

    if (rotation.status !== RotationStatus.Ready) {
      throw new RotationNotCancelableError();
    }

    await this.repository.cancel(
      command.rotationId,
      command.actorId,
      command.reason,
    );
  }
}
