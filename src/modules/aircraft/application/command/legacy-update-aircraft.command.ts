import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../operators/infra/database/repository/aircraft.repository';
import { CheckOperatorExistsQuery } from '../../../operators/application/query/check-operator-exists.query';
import { AircraftNotFoundError } from '../../../operators/model/error/aircraft.error';
import { OperatorNotFoundError } from '../../../operators/model/error/operator.error';
import { LegacyUpdateAircraftRequest } from '../../../operators/infra/http/request/aircraft.request';
import { AircraftWasEditedEvent } from '../../../operators/application/event/aircraft.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class LegacyUpdateAircraftCommand {
  constructor(
    public readonly aircraftId: string,
    public readonly data: LegacyUpdateAircraftRequest,
  ) {}
}

@CommandHandler(LegacyUpdateAircraftCommand)
export class LegacyUpdateAircraftHandler implements ICommandHandler<LegacyUpdateAircraftCommand> {
  constructor(
    private readonly repository: AircraftRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: LegacyUpdateAircraftCommand): Promise<void> {
    const { aircraftId, data } = command;

    const aircraft = await this.repository.exists({ id: aircraftId });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    if (data.operatorId !== undefined) {
      const operatorExists = await this.queryBus.execute(
        new CheckOperatorExistsQuery(data.operatorId),
      );

      if (!operatorExists) {
        throw new OperatorNotFoundError();
      }
    }

    const updated = await this.repository.legacyUpdate(aircraftId, data);
    const operator = updated.operator as { id: string };
    const event = new AircraftWasEditedEvent({
      aircraftId,
      operatorId: operator.id,
    });
    this.eventEmitter.emit(AircraftWasEditedEvent.name, event);
  }
}
