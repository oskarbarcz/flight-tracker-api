import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../repository/aircraft.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { CreateAircraftRequest } from '../../../controller/request/aircraft.request';
import { AircraftWithRegistrationAlreadyExistsError } from '../../../model/error/aircraft.error';
import { OperatorsRepository } from '../../../repository/operators.repository';

export class CreateAircraftCommand {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
    public readonly data: CreateAircraftRequest,
  ) {}
}

@CommandHandler(CreateAircraftCommand)
export class CreateAircraftHandler implements ICommandHandler<CreateAircraftCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(command: CreateAircraftCommand): Promise<void> {
    const { operatorId, aircraftId, data } = command;

    const operatorExists = await this.operatorsRepository.exists(
      command.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    const registrationExists = await this.aircraftRepository.exists({
      registration: data.registration,
    });

    if (registrationExists) {
      throw new AircraftWithRegistrationAlreadyExistsError();
    }

    await this.aircraftRepository.create(aircraftId, operatorId, data);
  }
}
