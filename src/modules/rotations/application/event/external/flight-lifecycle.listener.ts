import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  PilotCheckedInEvent,
  FlightWasClosedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { RotationsRepository } from '../../../infra/database/repository/rotations.repository';
import { RotationStatus } from '../../../model/rotation.model';

@Injectable()
export class FlightLifecycleListener {
  constructor(private readonly repository: RotationsRepository) {}

  @OnEvent(FlightEventType.PilotCheckedIn)
  async onPilotCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    const leg = await this.repository.findLegByFlightId(event.payload.flightId);
    if (!leg) {
      return;
    }

    const rotation = await this.repository.findById(leg.rotationId);
    if (!rotation || rotation.status !== RotationStatus.Ready) {
      return;
    }

    await this.repository.updateStatus(
      rotation.id,
      RotationStatus.InProgress,
      event.payload.actorId,
    );
  }

  @OnEvent(FlightEventType.FlightWasClosed)
  async onFlightWasClosed(event: FlightWasClosedEvent): Promise<void> {
    const leg = await this.repository.findLegByFlightId(event.payload.flightId);
    if (!leg) {
      return;
    }

    const rotation = await this.repository.findById(leg.rotationId);
    if (!rotation || rotation.status !== RotationStatus.InProgress) {
      return;
    }

    const lastLeg = rotation.legs[rotation.legs.length - 1];
    if (!lastLeg || lastLeg.id !== leg.id) {
      return;
    }

    await this.repository.updateStatus(
      rotation.id,
      RotationStatus.Finished,
      event.payload.actorId,
    );
  }
}
