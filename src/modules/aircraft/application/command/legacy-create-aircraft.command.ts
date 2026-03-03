import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../operators/infra/database/repository/aircraft.repository';
import { CheckOperatorExistsQuery } from '../../../operators/application/query/check-operator-exists.query';
import { OperatorNotFoundError } from '../../../operators/model/error/operator.error';
import { LegacyCreateAircraftRequest } from '../../../operators/infra/http/request/aircraft.request';
import { AircraftWithRegistrationAlreadyExistsError } from '../../../operators/model/error/aircraft.error';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AircraftWasCreatedEvent } from '../../../operators/application/event/aircraft.event';

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
    private readonly eventEmitter: EventEmitter2,
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

    const event = new AircraftWasCreatedEvent({
      aircraftId,
      operatorId: data.operatorId,
    });
    this.eventEmitter.emit(AircraftWasCreatedEvent.name, event);
  }
}
