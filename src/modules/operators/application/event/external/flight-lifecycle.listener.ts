import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  FlightWasCreatedEvent,
  PilotCheckedInEvent,
  OffBlockWasReportedEvent,
  OnBlockWasReportedEvent,
  FlightWasClosedEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { AircraftState } from '../../../model/aircraft.model';

@Injectable()
export class FlightLifecycleListener {
  constructor(private readonly aircraftRepository: AircraftRepository) {}

  @OnEvent(FlightEventType.FlightWasCreated)
  async onFlightWasCreated(event: FlightWasCreatedEvent): Promise<void> {
    await this.aircraftRepository.updateState(
      event.payload.aircraftId,
      AircraftState.Planned,
    );
  }

  @OnEvent(FlightEventType.PilotCheckedIn)
  async onPilotCheckedIn(event: PilotCheckedInEvent): Promise<void> {
    await this.aircraftRepository.updateState(
      event.payload.aircraftId,
      AircraftState.CheckedIn,
    );
  }

  @OnEvent(FlightEventType.OffBlockWasReported)
  async onOffBlockWasReported(event: OffBlockWasReportedEvent): Promise<void> {
    await this.aircraftRepository.updateState(
      event.payload.aircraftId,
      AircraftState.Cruise,
    );
  }

  @OnEvent(FlightEventType.OnBlockWasReported)
  async onOnBlockWasReported(event: OnBlockWasReportedEvent): Promise<void> {
    await this.aircraftRepository.updateState(
      event.payload.aircraftId,
      AircraftState.Idle,
    );
    await this.aircraftRepository.updateLastLocation(
      event.payload.aircraftId,
      event.payload.landingAirportId,
      new Date(),
    );
  }

  @OnEvent(FlightEventType.FlightWasClosed)
  async onFlightWasClosed(event: FlightWasClosedEvent): Promise<void> {
    await this.aircraftRepository.updateState(
      event.payload.aircraftId,
      AircraftState.Idle,
    );
  }
}
