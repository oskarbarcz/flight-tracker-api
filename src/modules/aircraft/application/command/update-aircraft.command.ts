import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { OperatorForAircraftNotFoundError } from '../../dto/errors.dto';
import { AircraftRepository } from '../../repository/aircraft.repository';
import { UpdateAircraftRequest } from '../../dto/update-aircraft.dto';
import { CheckOperatorExistsQuery } from '../../../operators/application/query/check-operator-exists.query';

export class UpdateAircraftCommand {
  constructor(
    public readonly aircraftId: string,
    public readonly data: UpdateAircraftRequest,
  ) {}
}

@CommandHandler(UpdateAircraftCommand)
export class UpdateAircraftHandler implements ICommandHandler<UpdateAircraftCommand> {
  constructor(
    private readonly repository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: UpdateAircraftCommand): Promise<void> {
    const { aircraftId, data } = command;

    const aircraft = await this.repository.findOneBy({ id: aircraftId });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    if (data.operatorId !== undefined) {
      const operatorExists = await this.queryBus.execute(
        new CheckOperatorExistsQuery(data.operatorId),
      );

      if (!operatorExists) {
        throw new NotFoundException(OperatorForAircraftNotFoundError);
      }
    }

    await this.repository.update(aircraftId, data);
  }
}
