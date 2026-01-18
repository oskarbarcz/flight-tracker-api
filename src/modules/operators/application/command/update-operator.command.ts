import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { OperatorDoesNotExistsError } from '../../dto/errors';
import { OperatorsRepository } from '../../repository/operators.repository';
import { UpdateOperatorDto } from '../../dto/update-operator.dto';

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
      throw new NotFoundException(OperatorDoesNotExistsError);
    }

    await this.repository.update(operatorId, data);
  }
}
