import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../operators/repository/aircraft.repository';
import { CheckOperatorExistsQuery } from '../../../operators/application/query/check-operator-exists.query';
import { AircraftNotFoundError } from '../../../operators/model/error/aircraft.error';
import { OperatorNotFoundError } from '../../../operators/model/error/operator.error';
import { LegacyUpdateAircraftRequest } from '../../../operators/controller/request/aircraft.request';

export class LegacyUpdateAircraftCommand {
  constructor(
    public readonly aircraftId: string,
    public readonly data: LegacyUpdateAircraftRequest,
  ) {}
}

@CommandHandler(LegacyUpdateAircraftCommand)
export class UpdateAircraftHandler implements ICommandHandler<LegacyUpdateAircraftCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: LegacyUpdateAircraftCommand): Promise<void> {
    const { aircraftId, data } = command;

    const aircraft = await this.aircraftRepository.exists({ id: aircraftId });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    if (data.operatorId !== undefined) {
      const operatorExists = await this.queryBus.execute(
        new CheckOperatorExistsQuery(data.operatorId),
      );

      if (!operatorExists) {
        throw new OperatorNotFoundError();
      }
    }

    await this.aircraftRepository.update(aircraftId, data);
  }
}
