import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { UpdateAircraftRequest } from '../../../infra/http/request/aircraft.request';
import { AircraftNotFoundError } from '../../../model/error/aircraft.error';

export class UpdateAircraftCommand {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
    public readonly data: UpdateAircraftRequest,
  ) {}
}

@CommandHandler(UpdateAircraftCommand)
export class UpdateAircraftHandler implements ICommandHandler<UpdateAircraftCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(command: UpdateAircraftCommand): Promise<void> {
    const { aircraftId, data } = command;

    const operatorExists = await this.operatorsRepository.exists(
      command.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    const aircraft = await this.aircraftRepository.findOneBy({
      id: aircraftId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    await this.aircraftRepository.update(aircraftId, data);
  }
}
