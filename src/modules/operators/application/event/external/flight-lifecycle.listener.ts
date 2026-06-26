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
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';

@Injectable()
export class FlightLifecycleListener {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly prisma: PrismaService,
  ) {}

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

    const flight = await this.prisma.flight.findUnique({
      where: { id: event.payload.flightId },
      select: { arrivalGateId: true },
    });

    await this.aircraftRepository.updateLastLocation(
      event.payload.aircraftId,
      event.payload.landingAirportId,
      flight?.arrivalGateId ?? null,
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
