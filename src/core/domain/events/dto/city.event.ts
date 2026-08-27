import { DomainEvent } from './event';

export enum CityEventType {
  CityWasCreated = 'city.created',
  CityWasRenamed = 'city.renamed',
}

type CityWasCreatedPayload = {
  cityId: string;
  name: string;
  country: string;
};

type CityWasRenamedPayload = {
  cityId: string;
  name: string;
  country: string;
  previousName: string;
  previousCountry: string;
};

export class CityWasCreatedEvent extends DomainEvent {
  public static readonly name = CityEventType.CityWasCreated;

  constructor(public readonly payload: CityWasCreatedPayload) {
    super();
  }
}

export class CityWasRenamedEvent extends DomainEvent {
  public static readonly name = CityEventType.CityWasRenamed;

  constructor(public readonly payload: CityWasRenamedPayload) {
    super();
  }
}
