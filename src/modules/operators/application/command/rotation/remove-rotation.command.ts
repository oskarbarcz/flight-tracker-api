import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { RotationsRepository } from '../../../infra/database/repository/rotations.repository';
import { RotationNotFoundError } from '../../../model/error/rotation.error';

export class RemoveRotationCommand {
  constructor(
    public readonly operatorId: string,
    public readonly rotationId: string,
  ) {}
}

@CommandHandler(RemoveRotationCommand)
export class RemoveRotationHandler implements ICommandHandler<RemoveRotationCommand> {
  constructor(
    private readonly rotationsRepository: RotationsRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(command: RemoveRotationCommand): Promise<void> {
    const { operatorId, rotationId } = command;

    const operatorExists = await this.operatorsRepository.exists(operatorId);

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    const rotationExists = await this.rotationsRepository.exists(rotationId);

    if (!rotationExists) {
      throw new RotationNotFoundError();
    }

    await this.rotationsRepository.remove(rotationId);
  }
}
