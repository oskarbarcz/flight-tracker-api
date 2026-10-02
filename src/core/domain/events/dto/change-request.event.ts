import { DomainEvent } from './event';

export enum ChangeRequestEventType {
  ChangeRequestWasDecided = 'change-request.decided',
}

type ChangeRequestWasDecidedPayload = {
  changeRequestId: string;
  resource: string;
  targetId: string;
  status: 'accepted' | 'rejected';
  requestedById: string;
  decidedById: string;
};

export class ChangeRequestWasDecidedEvent extends DomainEvent {
  public static readonly name = ChangeRequestEventType.ChangeRequestWasDecided;

  constructor(public readonly payload: ChangeRequestWasDecidedPayload) {
    super();
  }
}
