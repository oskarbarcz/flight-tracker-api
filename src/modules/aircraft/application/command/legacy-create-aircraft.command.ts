import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { AircraftRepository } from '../../../operators/repository/aircraft.repository';
import { CheckOperatorExistsQuery } from '../../../operators/application/query/check-operator-exists.query';
import { OperatorNotFoundError } from '../../../operators/model/error/operator.error';
import { LegacyCreateAircraftRequest } from '../../../operators/controller/request/aircraft.request';

export class LegacyCreateAircraftCommand {
  constructor(
    public readonly aircraftId: string,
    public readonly data: LegacyCreateAircraftRequest,
  ) {}
}

@CommandHandler(LegacyCreateAircraftCommand)
export class CreateAircraftHandler implements ICommandHandler<LegacyCreateAircraftCommand> {
  constructor(
    private readonly repository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: LegacyCreateAircraftCommand): Promise<void> {
    const { aircraftId, data } = command;

    const existing = await this.repository.findOneBy({
      registration: data.registration,
    });

    if (existing) {
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
