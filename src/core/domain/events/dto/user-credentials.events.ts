import { DomainEvent } from './event';

export enum UserCredentialsEventType {
  PasswordResetRequested = 'user.password-reset.requested',
  EmailChangeRequested = 'user.email-change.requested',
}

type PasswordResetRequestedPayload = {
  userId: string;
  email: string;
  token: string;
};

export class PasswordResetRequestedEvent extends DomainEvent {
  public static readonly name = UserCredentialsEventType.PasswordResetRequested;

  constructor(public readonly payload: PasswordResetRequestedPayload) {
    super();
  }
}

type EmailChangeRequestedPayload = {
  userId: string;
  currentEmail: string;
  newEmail: string;
  token: string;
};

export class EmailChangeRequestedEvent extends DomainEvent {
  public static readonly name = UserCredentialsEventType.EmailChangeRequested;

  constructor(public readonly payload: EmailChangeRequestedPayload) {
    super();
  }
}
