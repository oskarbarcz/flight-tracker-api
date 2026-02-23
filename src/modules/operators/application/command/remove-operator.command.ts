import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import {
  OperatorInUseError,
  OperatorNotFoundError,
} from '../../model/error/operator.error';

export class RemoveOperatorCommand {
  constructor(public readonly operatorId: string) {}
}

@CommandHandler(RemoveOperatorCommand)
export class RemoveOperatorHandler implements ICommandHandler<RemoveOperatorCommand> {
  constructor(private readonly repository: OperatorsRepository) {}

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

    const aircraftCount = await this.repository.countAircraft(operatorId);

    if (aircraftCount > 0) {
      throw new OperatorInUseError();
    }

    await this.repository.remove(operatorId);
  }
}
