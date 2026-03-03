import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../operators/infra/database/repository/aircraft.repository';
import {
  AircraftInUseError,
  AircraftNotFoundError,
} from '../../../operators/model/error/aircraft.error';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AircraftWasRemovedEvent } from '../../../operators/application/event/aircraft.event';

export class LegacyRemoveAircraftCommand {
  constructor(public readonly aircraftId: string) {}
}

@CommandHandler(LegacyRemoveAircraftCommand)
export class LegacyRemoveAircraftHandler implements ICommandHandler<LegacyRemoveAircraftCommand> {
  constructor(
    private readonly repository: AircraftRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: LegacyRemoveAircraftCommand): Promise<void> {
    const { aircraftId } = command;

    const aircraft = await this.repository.legacyFindOneBy({ id: aircraftId });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    const connectedFlights = await this.repository.countFlights(aircraftId);

    if (connectedFlights > 0) {
      throw new AircraftInUseError();
    }

    await this.repository.remove(aircraftId);
    const operator = aircraft.operator as { id: string };
    const event = new AircraftWasRemovedEvent({
      aircraftId,
      operatorId: operator.id,
    });
    this.eventEmitter.emit(AircraftWasRemovedEvent.name, event);
  }
}
