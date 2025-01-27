export enum EventType {
  FlightWasCheckedIn = 'flight.check-in',
  FlightWasClosed = 'flight.close',
  RefreshTokenWasChanged = 'user.refresh-token-change',
}

export type FlightWasCheckedInPayload = {
  flightId: string;
  userId: string;
};

export type FlightWasClosedPayload = {
  userId: string;
};

export type RefreshTokenWasChangedPayload = {
  userId: string;
  refreshToken: string | null;
};
