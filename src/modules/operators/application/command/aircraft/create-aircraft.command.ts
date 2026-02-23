import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { CheckOperatorExistsQuery } from '../../query/check-operator-exists.query';
import { AircraftRepository } from '../../../repository/aircraft.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { LegacyCreateAircraftRequest } from '../../../controller/request/aircraft.request';

export class CreateAircraftCommand {
  constructor(
    public readonly aircraftId: string,
    public readonly data: LegacyCreateAircraftRequest,
  ) {}
}

@CommandHandler(CreateAircraftCommand)
export class CreateAircraftHandler implements ICommandHandler<CreateAircraftCommand> {
  constructor(
    private readonly repository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateAircraftCommand): Promise<void> {
    const { aircraftId, data } = command;

    const registrationExists = await this.repository.exists({
      registration: data.registration,
    });

    if (registrationExists) {
      throw new BadRequestException(
        'Aircraft with given registration already exists.',
      );
    }

    const operatorExists = await this.queryBus.execute(
      new CheckOperatorExistsQuery(data.operatorId),
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    await this.repository.create(aircraftId, data);
  }
}
