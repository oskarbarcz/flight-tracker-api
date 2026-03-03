import { DomainEvent } from '../../../../core/events/event';

type AircraftEventPayload = { aircraftId: string; operatorId: string };

abstract class BaseAircraftEvent extends DomainEvent {
  public readonly timestamp = new Date();
  public static readonly name: string;

  constructor(public readonly payload: AircraftEventPayload) {
    super();
  }
}

export class AircraftWasCreatedEvent extends BaseAircraftEvent {
  public static readonly name = 'aircraft.created';
}

export class AircraftWasEditedEvent extends BaseAircraftEvent {
  public static readonly name = 'aircraft.edited';
}

export class AircraftWasRemovedEvent extends BaseAircraftEvent {
  public static readonly name = 'aircraft.removed';
}
