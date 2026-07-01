import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import { OperatorNotFoundError } from '../../model/error/operator.error';
import { UpdateOperatorRequest } from '../../infra/http/request/operator.request';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { OperatorUpdatedEvent } from '../../../../core/domain/events/dto/operator.event';

export class UpdateOperatorCommand {
  constructor(
    public readonly operatorId: string,
    public readonly data: UpdateOperatorRequest,
  ) {}
}

@CommandHandler(UpdateOperatorCommand)
export class UpdateOperatorHandler implements ICommandHandler<UpdateOperatorCommand> {
  constructor(
    private readonly repository: OperatorsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateOperatorCommand): Promise<void> {
    const { operatorId, data } = command;

    const operator = await this.repository.findOneBy({ id: operatorId });

    if (!operator) {
      throw new OperatorNotFoundError();
    }

    await this.repository.update(operatorId, data);
    this.domainEvents.emit(new OperatorUpdatedEvent({ operatorId }));
  }
}
