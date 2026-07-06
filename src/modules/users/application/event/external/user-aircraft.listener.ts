import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  PilotCheckedInEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { UserAircraftRepository } from '../../../infra/database/repository/user-aircraft.repository';

@Injectable()
export class UserAircraftListener {
  constructor(
    private readonly userAircraftRepository: UserAircraftRepository,
  ) {}

  @OnEvent(FlightEventType.PilotCheckedIn)
  async onPilotCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    const userId = event.payload.actorId;

    if (!userId) {
      return;
    }

    await this.userAircraftRepository.create({
      userId,
      aircraftId: event.payload.aircraftId,
      flightId: event.payload.flightId,
    });
  }
}
