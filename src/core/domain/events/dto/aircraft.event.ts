import { DomainEvent } from './event';

export enum AircraftEventType {
  AircraftWasCreated = 'aircraft.created',
  AircraftWasEdited = 'aircraft.edited',
  AircraftWasRemoved = 'aircraft.removed',
}

type AircraftEventPayload = { aircraftId: string; operatorId: string };

abstract class AircraftLifecycleEvent extends DomainEvent {
  public static readonly name: string;

  constructor(public readonly payload: AircraftEventPayload) {
    super();
  }
}

export class AircraftCreatedEvent extends AircraftLifecycleEvent {
  public static readonly name = AircraftEventType.AircraftWasCreated;
}

export class AircraftEditedEvent extends AircraftLifecycleEvent {
  public static readonly name = AircraftEventType.AircraftWasEdited;
}

export class AircraftRemovedEvent extends AircraftLifecycleEvent {
  public static readonly name = AircraftEventType.AircraftWasRemoved;
}
