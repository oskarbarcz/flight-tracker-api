import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FlightEventType,
  FlightLifecycleEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { FlightEventsGateway } from '../../../infra/gateway/flight-events.gateway';

@Injectable()
export class BroadcastFlightEventListener {
  constructor(private readonly gateway: FlightEventsGateway) {}

  @OnEvent(FlightEventType.FlightWasReleased)
  @OnEvent(FlightEventType.PilotCheckedIn)
  @OnEvent(FlightEventType.BoardingWasStarted)
  @OnEvent(FlightEventType.BoardingWasFinished)
  @OnEvent(FlightEventType.OffBlockWasReported)
  @OnEvent(FlightEventType.TakeoffWasReported)
  @OnEvent(FlightEventType.ArrivalWasReported)
  @OnEvent(FlightEventType.OnBlockWasReported)
  @OnEvent(FlightEventType.OffboardingWasStarted)
  @OnEvent(FlightEventType.OffboardingWasFinished)
  @OnEvent(FlightEventType.FlightWasClosed)
  @OnEvent(FlightEventType.FlightTrackWasSaved)
  @OnEvent(FlightEventType.LivePositionReceived)
  @OnEvent(FlightEventType.PreliminaryLoadsheetWasUpdated)
  @OnEvent(FlightEventType.ScheduledTimesheetWasUpdated)
  @OnEvent(FlightEventType.PredictedTimesheetWasUpdated)
  @OnEvent(FlightEventType.DepartureParkingPositionWasChanged)
  @OnEvent(FlightEventType.DepartureRunwayWasChanged)
  @OnEvent(FlightEventType.ArrivalParkingPositionWasChanged)
  @OnEvent(FlightEventType.ArrivalRunwayWasChanged)
  @OnEvent(FlightEventType.EmergencyWasDeclared)
  @OnEvent(FlightEventType.EmergencyWasUpdated)
  @OnEvent(FlightEventType.EmergencyWasResolved)
  @OnEvent(FlightEventType.DiversionWasReported)
  @OnEvent(FlightEventType.DiversionWasUpdated)
  @OnEvent(FlightEventType.DelayRequestWasCreated)
  @OnEvent(FlightEventType.DelayReportWasFiled)
  @OnEvent(FlightEventType.DelayReportWasAccepted)
  @OnEvent(FlightEventType.DelayReportWasRejected)
  async onFlightEvent(event: FlightLifecycleEvent): Promise<void> {
    await this.gateway.publishToFlight({ type: event.type, ...event.payload });
  }
}
