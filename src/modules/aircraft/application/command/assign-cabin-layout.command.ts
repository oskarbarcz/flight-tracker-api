import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import { AircraftNotFoundError } from '../../model/error/aircraft.error';
import { GetCabinLayoutQuery } from '../../../cabin-layouts/application/query/get-cabin-layout.query';

export class AssignCabinLayoutCommand {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
    public readonly cabinLayout: string,
  ) {}
}

@CommandHandler(AssignCabinLayoutCommand)
export class AssignCabinLayoutHandler implements ICommandHandler<AssignCabinLayoutCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: AssignCabinLayoutCommand): Promise<void> {
    const { operatorId, aircraftId, cabinLayout } = command;

    const operatorQuery = new AssertOperatorExistsQuery(operatorId);
    await this.queryBus.execute(operatorQuery);

    const aircraft = await this.aircraftRepository.findOneBy({
      id: aircraftId,
      operatorId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    const layoutQuery = new GetCabinLayoutQuery(cabinLayout);
    await this.queryBus.execute(layoutQuery);

    await this.aircraftRepository.updateCabinLayout(aircraftId, cabinLayout);
  }
}
