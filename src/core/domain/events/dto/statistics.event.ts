import { DomainEvent } from './event';

export enum StatisticsEventType {
  UserStatisticsChanged = 'statistics.user-changed',
}

type UserStatisticsChangedPayload = { userId: string };

export class UserStatisticsChangedEvent extends DomainEvent {
  public static readonly name = StatisticsEventType.UserStatisticsChanged;

  constructor(public readonly payload: UserStatisticsChangedPayload) {
    super();
  }
}
