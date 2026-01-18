import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { OperatorAlreadyExistsError } from '../../dto/errors';
import { OperatorsRepository } from '../../repository/operators.repository';
import { CreateOperatorDto } from '../../dto/create-operator.dto';

export class CreateOperatorCommand {
  constructor(
    public readonly operatorId: string,
    public readonly data: CreateOperatorDto,
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
      throw new BadRequestException(OperatorAlreadyExistsError);
    }

    await this.repository.create(operatorId, data);
  }
}
