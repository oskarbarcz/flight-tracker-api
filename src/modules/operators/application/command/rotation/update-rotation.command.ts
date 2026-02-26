import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { RotationsRepository } from '../../../infra/database/repository/rotations.repository';
import { RotationNotFoundError } from '../../../model/error/rotation.error';
import { UpdateRotationRequest } from '../../../infra/http/request/rotation.request';
import { AssertUserExistsQuery } from '../../../../users/application/query/assert-user-exists.query';

export class UpdateRotationCommand {
  constructor(
    public readonly operatorId: string,
    public readonly rotationId: string,
    public readonly data: UpdateRotationRequest,
  ) {}
}

@CommandHandler(UpdateRotationCommand)
export class UpdateRotationHandler implements ICommandHandler<UpdateRotationCommand> {
  constructor(
    private readonly rotationsRepository: RotationsRepository,
    private readonly operatorsRepository: OperatorsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: UpdateRotationCommand): Promise<void> {
    const { operatorId, rotationId, data } = command;

    const operatorExists = await this.operatorsRepository.exists(operatorId);

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    const rotationExists = await this.rotationsRepository.exists(rotationId);

    if (!rotationExists) {
      throw new RotationNotFoundError();
    }

    if (data.pilotId) {
      await this.queryBus.execute(new AssertUserExistsQuery(data.pilotId));
    }

    await this.rotationsRepository.update(rotationId, data);
  }
}
