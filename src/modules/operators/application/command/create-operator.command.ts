import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import { OperatorAlreadyExistsError } from '../../model/error/operator.error';
import { CreateOperatorRequest } from '../../infra/http/request/operator.request';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { OperatorCreatedEvent } from '../../../../core/domain/events/dto/operator.event';

export class CreateOperatorCommand {
  constructor(
    public readonly operatorId: string,
    public readonly data: CreateOperatorRequest,
  ) {}
}

@CommandHandler(CreateOperatorCommand)
export class CreateOperatorHandler implements ICommandHandler<CreateOperatorCommand> {
  constructor(
    private readonly repository: OperatorsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: CreateOperatorCommand): Promise<void> {
    const { operatorId, data } = command;

    const existing = await this.repository.findOneBy({
      icaoCode: data.icaoCode,
    });

    if (existing) {
      throw new OperatorAlreadyExistsError();
    }

    await this.repository.create(operatorId, data);
    this.domainEvents.emit(new OperatorCreatedEvent({ operatorId }));
  }
}
