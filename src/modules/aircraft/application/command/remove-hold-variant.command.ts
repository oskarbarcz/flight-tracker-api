import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import { AircraftNotFoundError } from '../../model/error/aircraft.error';

export class RemoveHoldVariantCommand {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
  ) {}
}

@CommandHandler(RemoveHoldVariantCommand)
export class RemoveHoldVariantHandler implements ICommandHandler<RemoveHoldVariantCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: RemoveHoldVariantCommand): Promise<void> {
    const { operatorId, aircraftId } = command;

    const operatorQuery = new AssertOperatorExistsQuery(operatorId);
    await this.queryBus.execute(operatorQuery);

    const aircraft = await this.aircraftRepository.findOneBy({
      id: aircraftId,
      operatorId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    await this.aircraftRepository.updateHoldVariant(aircraftId, null);
  }
}
