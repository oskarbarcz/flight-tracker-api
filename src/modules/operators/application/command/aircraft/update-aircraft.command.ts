import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { UpdateAircraftRequest } from '../../../infra/http/request/aircraft.request';
import { AircraftNotFoundError } from '../../../model/error/aircraft.error';
import { findAirframeByType } from '../../../../airframes/data/airframes';
import { AirframeNotFoundError } from '../../../../airframes/model/error/airframe.error';
import { DomainEventEmitter } from '../../../../../core/domain/events/domain-event-emitter';
import { AircraftEditedEvent } from '../../../../../core/domain/events/dto/aircraft.event';

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
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: UpdateAircraftCommand): Promise<void> {
    const { operatorId, aircraftId, data } = command;

    const operatorExists = await this.operatorsRepository.exists(operatorId);

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    const aircraft = await this.aircraftRepository.findOneBy({
      id: aircraftId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    if (data.type !== undefined && !findAirframeByType(data.type)) {
      throw new AirframeNotFoundError();
    }

    await this.aircraftRepository.update(aircraftId, data);
    await this.domainEvents.emitAsync(
      new AircraftEditedEvent({ aircraftId, operatorId }),
    );
  }
}
