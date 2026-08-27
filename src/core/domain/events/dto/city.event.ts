import { DomainEvent } from './event';

export enum CityEventType {
  CityWasCreated = 'city.created',
}

type CityWasCreatedPayload = {
  cityId: string;
  name: string;
  country: string;
};

export class CityWasCreatedEvent extends DomainEvent {
  public static readonly name = CityEventType.CityWasCreated;

  constructor(public readonly payload: CityWasCreatedPayload) {
    super();
  }
}
