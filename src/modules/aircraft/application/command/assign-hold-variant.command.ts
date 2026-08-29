import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import { AircraftNotFoundError } from '../../model/error/aircraft.error';
import { AssertHoldVariantOfferedQuery } from '../../../manifest/application/assert/assert-hold-variant-offered.query';

export class AssignHoldVariantCommand {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
    public readonly holdVariant: string,
  ) {}
}

@CommandHandler(AssignHoldVariantCommand)
export class AssignHoldVariantHandler implements ICommandHandler<AssignHoldVariantCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: AssignHoldVariantCommand): Promise<void> {
    const { operatorId, aircraftId, holdVariant } = command;

    const operatorQuery = new AssertOperatorExistsQuery(operatorId);
    await this.queryBus.execute(operatorQuery);

    const aircraft = await this.aircraftRepository.findOneBy({
      id: aircraftId,
      operatorId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    const variantQuery = new AssertHoldVariantOfferedQuery(
      aircraft.type,
      holdVariant,
    );
    await this.queryBus.execute(variantQuery);

    await this.aircraftRepository.updateHoldVariant(aircraftId, holdVariant);
  }
}
