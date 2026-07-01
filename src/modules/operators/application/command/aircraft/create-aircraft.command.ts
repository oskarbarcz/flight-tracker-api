import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { CreateAircraftRequest } from '../../../infra/http/request/aircraft.request';
import { AircraftWithRegistrationAlreadyExistsError } from '../../../model/error/aircraft.error';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { findAirframeByType } from '../../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../../airframes/model/error/airframe.error';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';
import { AircraftCreatedEvent } from '../../../../../core/domain/events/dto/aircraft.event';

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
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: CreateAircraftCommand): Promise<void> {
    const { operatorId, aircraftId, data } = command;

    const operatorExists = await this.operatorsRepository.exists(operatorId);

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    if (!findAirframeByType(data.type)) {
      throw new AirframeNotFoundError();
    }

    const registrationExists = await this.aircraftRepository.exists({
      registration: data.registration,
    });

    if (registrationExists) {
      throw new AircraftWithRegistrationAlreadyExistsError();
    }

    await this.aircraftRepository.create(aircraftId, operatorId, data);
    await this.domainEvents.emitAsync(
      new AircraftCreatedEvent({ aircraftId, operatorId }),
    );
  }
}
