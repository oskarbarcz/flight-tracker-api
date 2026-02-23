import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../operators/repository/aircraft.repository';
import { CheckOperatorExistsQuery } from '../../../operators/application/query/check-operator-exists.query';
import { OperatorNotFoundError } from '../../../operators/model/error/operator.error';
import { LegacyCreateAircraftRequest } from '../../../operators/controller/request/aircraft.request';
import { AircraftWithRegistrationAlreadyExistsError } from '../../../operators/model/error/aircraft.error';

export class LegacyCreateAircraftCommand {
  constructor(
    public readonly aircraftId: string,
    public readonly data: LegacyCreateAircraftRequest,
  ) {}
}

@CommandHandler(LegacyCreateAircraftCommand)
export class LegacyCreateAircraftHandler implements ICommandHandler<LegacyCreateAircraftCommand> {
  constructor(
    private readonly repository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: LegacyCreateAircraftCommand): Promise<void> {
    const { aircraftId, data } = command;

    const registrationExists = await this.repository.exists({
      registration: data.registration,
    });

    if (registrationExists) {
      throw new AircraftWithRegistrationAlreadyExistsError();
    }

    const operatorExists = await this.queryBus.execute(
      new CheckOperatorExistsQuery(data.operatorId),
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    await this.repository.legacyCreate(aircraftId, data);
  }
}
