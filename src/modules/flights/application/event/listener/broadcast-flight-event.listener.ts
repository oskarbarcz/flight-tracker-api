import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FlightEventType } from '../../../../../core/events/flight';
import { NewFlightEvent } from '../../../infra/http/request/event.dto';
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
  @OnEvent(FlightEventType.FlightWasAddedToRotation)
  @OnEvent(FlightEventType.FlightWasRemovedFromRotation)
  @OnEvent(FlightEventType.DepartureGateWasChanged)
  @OnEvent(FlightEventType.DepartureRunwayWasChanged)
  @OnEvent(FlightEventType.ArrivalGateWasChanged)
  @OnEvent(FlightEventType.ArrivalRunwayWasChanged)
  @OnEvent(FlightEventType.EmergencyWasDeclared)
  @OnEvent(FlightEventType.EmergencyWasUpdated)
  @OnEvent(FlightEventType.EmergencyWasResolved)
  @OnEvent(FlightEventType.DiversionWasReported)
  @OnEvent(FlightEventType.DiversionWasUpdated)
  async onFlightEvent(event: NewFlightEvent): Promise<void> {
    await this.gateway.publishToFlight(event);
  }
}
