import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import {
  AircraftInUseError,
  AircraftNotFoundError,
} from '../../model/error/aircraft.error';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { AircraftRemovedEvent } from '../../../../core/domain/events/dto/aircraft.event';

export class RemoveAircraftCommand {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
  ) {}
}

@CommandHandler(RemoveAircraftCommand)
export class RemoveAircraftHandler implements ICommandHandler<RemoveAircraftCommand> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly domainEvents: DomainEventEmitter,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: RemoveAircraftCommand): Promise<void> {
    const { operatorId, aircraftId } = command;

    const operatorQuery = new AssertOperatorExistsQuery(operatorId);
    await this.queryBus.execute(operatorQuery);

    const aircraft = await this.aircraftRepository.findOneBy({
      id: aircraftId,
      operatorId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    const connectedFlights =
      await this.aircraftRepository.countFlights(aircraftId);

    if (connectedFlights > 0) {
      throw new AircraftInUseError();
    }

    await this.aircraftRepository.remove(aircraftId);
    await this.domainEvents.emitAsync(
      new AircraftRemovedEvent({ aircraftId, operatorId }),
    );
  }
}
