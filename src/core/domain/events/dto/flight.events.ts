import { DomainEvent } from './event';
import { InputJsonValue } from '../../../../../prisma/client/internal/prismaNamespace';

export enum FlightEventScope {
  System = 'system',
  Operations = 'operations',
  User = 'user',
}

export enum FlightEventType {
  FlightWasCreated = 'flight.created',
  PreliminaryLoadsheetWasUpdated = 'flight.preliminary-loadsheet-updated',
  ScheduledTimesheetWasUpdated = 'flight.scheduled-timesheet-updated',
  PredictedTimesheetWasUpdated = 'flight.predicted-timesheet-updated',
  DepartureGateWasChanged = 'flight.departure-gate-changed',
  DepartureRunwayWasChanged = 'flight.departure-runway-changed',
  ArrivalGateWasChanged = 'flight.arrival-gate-changed',
  ArrivalRunwayWasChanged = 'flight.arrival-runway-changed',
  FlightWasAddedToRotation = 'flight.added-to-rotation',
  FlightWasRemovedFromRotation = 'flight.removed-from-rotation',
  FlightWasReleased = 'flight.released',
  PilotCheckedIn = 'flight.pilot-checked-in',
  BoardingWasStarted = 'flight.boarding-started',
  BoardingWasFinished = 'flight.boarding-finished',
  OffBlockWasReported = 'flight.off-block-reported',
  TakeoffWasReported = 'flight.takeoff-reported',
  ArrivalWasReported = 'flight.arrival-reported',
  OnBlockWasReported = 'flight.on-block-reported',
  OffboardingWasStarted = 'flight.offboarding-started',
  OffboardingWasFinished = 'flight.offboarding-finished',
  FlightWasClosed = 'flight.closed',
  FlightTrackWasSaved = 'flight.track-saved',
  LivePositionReceived = 'flight.live-position-received',
  EmergencyWasDeclared = 'flight.emergency-declared',
  EmergencyWasUpdated = 'flight.emergency-updated',
  EmergencyWasResolved = 'flight.emergency-resolved',
  DiversionWasReported = 'flight.diversion-reported',
  DiversionWasUpdated = 'flight.diversion-updated',
  DelayRequestWasCreated = 'flight.delay-request-created',
  DelayReportWasFiled = 'flight.delay-report-filed',
  DelayReportWasAccepted = 'flight.delay-report-accepted',
  DelayReportWasRejected = 'flight.delay-report-rejected',
}

export type FlightEventPayload = {
  flightId: string;
  scope: FlightEventScope;
  actorId: string | null;
  rotationId?: string | null;
  payload?: InputJsonValue;
};

export type AircraftFlightEventPayload = FlightEventPayload & {
  aircraftId: string;
};

export type AircraftLandedEventPayload = AircraftFlightEventPayload & {
  landingAirportId: string;
};

export abstract class FlightLifecycleEvent<
  P extends FlightEventPayload = FlightEventPayload,
> extends DomainEvent {
  static readonly name: string;

  constructor(public readonly payload: P) {
    super();
  }

  get type(): FlightEventType {
    return (this.constructor as typeof DomainEvent).name as FlightEventType;
  }
}

export class FlightWasCreatedEvent extends FlightLifecycleEvent<AircraftFlightEventPayload> {
  static readonly name = FlightEventType.FlightWasCreated;
}

export class PreliminaryLoadsheetWasUpdatedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.PreliminaryLoadsheetWasUpdated;
}

export class ScheduledTimesheetWasUpdatedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.ScheduledTimesheetWasUpdated;
}

export class PredictedTimesheetWasUpdatedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.PredictedTimesheetWasUpdated;
}

export class DepartureGateWasChangedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.DepartureGateWasChanged;
}

export class DepartureRunwayWasChangedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.DepartureRunwayWasChanged;
}

export class ArrivalGateWasChangedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.ArrivalGateWasChanged;
}

export class ArrivalRunwayWasChangedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.ArrivalRunwayWasChanged;
}

export class FlightWasAddedToRotationEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.FlightWasAddedToRotation;
}

export class FlightWasRemovedFromRotationEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.FlightWasRemovedFromRotation;
}

export class FlightWasReleasedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.FlightWasReleased;
}

export class PilotCheckedInEvent extends FlightLifecycleEvent<AircraftFlightEventPayload> {
  static readonly name = FlightEventType.PilotCheckedIn;
}

export class BoardingWasStartedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.BoardingWasStarted;
}

export class BoardingWasFinishedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.BoardingWasFinished;
}

export class OffBlockWasReportedEvent extends FlightLifecycleEvent<AircraftFlightEventPayload> {
  static readonly name = FlightEventType.OffBlockWasReported;
}

export class TakeoffWasReportedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.TakeoffWasReported;
}

export class ArrivalWasReportedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.ArrivalWasReported;
}

export class OnBlockWasReportedEvent extends FlightLifecycleEvent<AircraftLandedEventPayload> {
  static readonly name = FlightEventType.OnBlockWasReported;
}

export class OffboardingWasStartedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.OffboardingWasStarted;
}

export class OffboardingWasFinishedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.OffboardingWasFinished;
}

export class FlightWasClosedEvent extends FlightLifecycleEvent<AircraftFlightEventPayload> {
  static readonly name = FlightEventType.FlightWasClosed;
}

export class FlightTrackWasSavedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.FlightTrackWasSaved;
}

export class LivePositionReceivedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.LivePositionReceived;
}

export class EmergencyWasDeclaredEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.EmergencyWasDeclared;
}

export class EmergencyWasUpdatedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.EmergencyWasUpdated;
}

export class EmergencyWasResolvedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.EmergencyWasResolved;
}

export class DiversionWasReportedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.DiversionWasReported;
}

export class DiversionWasUpdatedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.DiversionWasUpdated;
}

export class DelayRequestWasCreatedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.DelayRequestWasCreated;
}

export class DelayReportWasFiledEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.DelayReportWasFiled;
}

export class DelayReportWasAcceptedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.DelayReportWasAccepted;
}

export class DelayReportWasRejectedEvent extends FlightLifecycleEvent {
  static readonly name = FlightEventType.DelayReportWasRejected;
}
