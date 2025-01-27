export enum EventType {
  FlightWasCheckedIn = 'flight.check-in',
  FlightWasClosed = 'flight.close',
}

export type FlightWasCheckedInPayload = {
  flightId: string;
  userId: string;
};

export type FlightWasClosedPayload = {
  userId: string;
};
