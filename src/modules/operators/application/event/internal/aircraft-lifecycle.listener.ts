import { OnEvent } from '@nestjs/event-emitter';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { Injectable } from '@nestjs/common';
import {
  AircraftEventType,
  AircraftCreatedEvent,
  AircraftEditedEvent,
  AircraftRemovedEvent,
} from 'src/core/domain/events/dto/aircraft.event';

@Injectable()
export class AircraftLifecycleListener {
  constructor(private readonly operatorsRepository: OperatorsRepository) {}

  @OnEvent(AircraftEventType.AircraftWasCreated)
  @OnEvent(AircraftEventType.AircraftWasEdited)
  @OnEvent(AircraftEventType.AircraftWasRemoved)
  async updateFleet(
    event: AircraftCreatedEvent | AircraftEditedEvent | AircraftRemovedEvent,
  ): Promise<void> {
    await this.operatorsRepository.updateFleet(event.payload.operatorId);
  }
}
