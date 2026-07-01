import { DomainEvent } from './event';

export enum OperatorEventType {
  OperatorWasCreated = 'operator.created',
  OperatorWasUpdated = 'operator.updated',
  OperatorWasRemoved = 'operator.removed',
}

type OperatorEventPayload = { operatorId: string };

abstract class OperatorLifecycleEvent extends DomainEvent {
  public static readonly name: string;

  constructor(public readonly payload: OperatorEventPayload) {
    super();
  }
}

export class OperatorCreatedEvent extends OperatorLifecycleEvent {
  public static readonly name = OperatorEventType.OperatorWasCreated;
}

export class OperatorUpdatedEvent extends OperatorLifecycleEvent {
  public static readonly name = OperatorEventType.OperatorWasUpdated;
}

export class OperatorRemovedEvent extends OperatorLifecycleEvent {
  public static readonly name = OperatorEventType.OperatorWasRemoved;
}
