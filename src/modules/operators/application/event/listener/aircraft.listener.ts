import {
  AircraftWasCreatedEvent,
  AircraftWasEditedEvent,
  AircraftWasRemovedEvent,
} from '../aircraft.event';
import { OnEvent } from '@nestjs/event-emitter';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AircraftListener {
  constructor(private readonly operatorsRepository: OperatorsRepository) {}

  @OnEvent(AircraftWasCreatedEvent.name)
  @OnEvent(AircraftWasEditedEvent.name)
  @OnEvent(AircraftWasRemovedEvent.name)
  async onAircraftWasCreated(
    event:
      | AircraftWasCreatedEvent
      | AircraftWasEditedEvent
      | AircraftWasRemovedEvent,
  ): Promise<void> {
    await this.operatorsRepository.updateFleet(event.payload.operatorId);
  }
}
