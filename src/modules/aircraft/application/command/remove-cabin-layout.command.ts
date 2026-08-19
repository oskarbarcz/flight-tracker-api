import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import { AircraftNotFoundError } from '../../model/error/aircraft.error';

export class RemoveCabinLayoutCommand {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
  ) {}
}

@CommandHandler(RemoveCabinLayoutCommand)
export class RemoveCabinLayoutHandler implements ICommandHandler<RemoveCabinLayoutCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: RemoveCabinLayoutCommand): Promise<void> {
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

    await this.aircraftRepository.updateCabinLayout(aircraftId, null);
  }
}
