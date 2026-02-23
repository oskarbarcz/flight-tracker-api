import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import { OperatorNotFoundError } from '../../model/error/operator.error';
import { UpdateOperatorDto } from '../../infra/http/request/operator.request';

export class UpdateOperatorCommand {
  constructor(
    public readonly operatorId: string,
    public readonly data: UpdateOperatorDto,
  ) {}
}

@CommandHandler(UpdateOperatorCommand)
export class UpdateOperatorHandler implements ICommandHandler<UpdateOperatorCommand> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(command: UpdateOperatorCommand): Promise<void> {
    const { operatorId, data } = command;

    const operator = await this.repository.findOneBy({ id: operatorId });

    if (!operator) {
      throw new OperatorNotFoundError();
    }

    await this.repository.update(operatorId, data);
  }
}
