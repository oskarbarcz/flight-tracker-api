import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import { OperatorAlreadyExistsError } from '../../model/error/operator.error';
import { CreateOperatorRequest } from '../../infra/http/request/operator.request';

export class CreateOperatorCommand {
  constructor(
    public readonly operatorId: string,
    public readonly data: CreateOperatorRequest,
  ) {}
}

@CommandHandler(CreateOperatorCommand)
export class CreateOperatorHandler implements ICommandHandler<CreateOperatorCommand> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(command: CreateOperatorCommand): Promise<void> {
    const { operatorId, data } = command;

    const existing = await this.repository.findOneBy({
      icaoCode: data.icaoCode,
    });

    if (existing) {
      throw new OperatorAlreadyExistsError();
    }

    await this.repository.create(operatorId, data);
  }
}
