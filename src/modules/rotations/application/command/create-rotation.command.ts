import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';

export class CreateRotationCommand {
  constructor(
    public readonly rotationId: string,
    public readonly name: string,
    public readonly operatorId: string,
    public readonly pilotId: string,
    public readonly actorId: string,
  ) {}
}

@CommandHandler(CreateRotationCommand)
export class CreateRotationHandler implements ICommandHandler<CreateRotationCommand> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(command: CreateRotationCommand): Promise<void> {
    await this.repository.create(
      command.rotationId,
      command.name,
      command.operatorId,
      command.pilotId,
      command.actorId,
    );
  }
}
