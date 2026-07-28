import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import {
  OperatorInUseError,
  OperatorNotFoundError,
} from '../../model/error/operator.error';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { OperatorRemovedEvent } from '../../../../core/domain/events/dto/operator.event';
import {
  GetOperatorFleetSummaryQuery,
  OperatorFleetSummary,
} from '../../../aircraft/application/query/get-operator-fleet-summary.query';

export class RemoveOperatorCommand {
  constructor(public readonly operatorId: string) {}
}

@CommandHandler(RemoveOperatorCommand)
export class RemoveOperatorHandler implements ICommandHandler<RemoveOperatorCommand> {
  constructor(
    private readonly repository: OperatorsRepository,
    private readonly domainEvents: DomainEventEmitter,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: RemoveOperatorCommand): Promise<void> {
    const { operatorId } = command;

    const operator = await this.repository.findOneBy({ id: operatorId });

    if (!operator) {
      throw new OperatorNotFoundError();
    }

    const flightsCount = await this.repository.countFlights(operatorId);

    if (flightsCount > 0) {
      throw new OperatorInUseError();
    }

    const fleetQuery = new GetOperatorFleetSummaryQuery(operatorId);
    const { fleetSize }: OperatorFleetSummary =
      await this.queryBus.execute(fleetQuery);

    if (fleetSize > 0) {
      throw new OperatorInUseError();
    }

    await this.repository.remove(operatorId);
    this.domainEvents.emit(new OperatorRemovedEvent({ operatorId }));
  }
}
