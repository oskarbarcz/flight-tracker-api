import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { CreateRotationRequest } from '../../../infra/http/request/rotation.request';
import { RotationsRepository } from '../../../infra/database/repository/rotations.repository';
import { AssertUserExistsQuery } from '../../../../users/application/query/assert-user-exists.query';

export class CreateRotationCommand {
  constructor(
    public readonly operatorId: string,
    public readonly rotationId: string,
    public readonly data: CreateRotationRequest,
  ) {}
}

@CommandHandler(CreateRotationCommand)
export class CreateRotationHandler implements ICommandHandler<CreateRotationCommand> {
  constructor(
    private readonly rotationsRepository: RotationsRepository,
    private readonly operatorsRepository: OperatorsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateRotationCommand): Promise<void> {
    const { operatorId, rotationId, data } = command;

    const operatorExists = await this.operatorsRepository.exists(
      command.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    await this.queryBus.execute(
      new AssertUserExistsQuery(command.data.pilotId),
    );

    await this.rotationsRepository.create(rotationId, operatorId, data);
  }
}
