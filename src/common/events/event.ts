export enum EventType {
  FlightWasCheckedIn = 'flight.check-in',
}

export type FlightWasCheckedInPayload = {
  flightId: string;
  userId: string;
};

type Payload = FlightWasCheckedInPayload;

export type Event<T extends Payload> = {
  type: EventType;
  payload: T;
};
