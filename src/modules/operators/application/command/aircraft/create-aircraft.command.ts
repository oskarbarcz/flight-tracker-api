import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CheckOperatorExistsQuery } from '../../query/check-operator-exists.query';
import { AircraftRepository } from '../../../repository/aircraft.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { CreateAircraftRequest } from '../../../controller/request/aircraft.request';
import { AircraftWithRegistrationAlreadyExistsError } from '../../../model/error/aircraft.error';

export class CreateAircraftCommand {
  constructor(
    public readonly aircraftId: string,
    public readonly operatorId: string,
    public readonly data: CreateAircraftRequest,
  ) {}
}

@CommandHandler(CreateAircraftCommand)
export class CreateAircraftHandler implements ICommandHandler<CreateAircraftCommand> {
  constructor(
    private readonly repository: AircraftRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateAircraftCommand): Promise<void> {
    const { aircraftId, operatorId, data } = command;

    const registrationExists = await this.repository.exists({
      registration: data.registration,
    });

    if (registrationExists) {
      throw new AircraftWithRegistrationAlreadyExistsError();
    }

    const operatorExists = await this.queryBus.execute(
      new CheckOperatorExistsQuery(operatorId),
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    await this.repository.create(aircraftId, operatorId, data);
  }
}
