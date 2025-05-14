export enum EventType {
  FlightWasCheckedIn = 'flight.check-in',
  FlightWasClosed = 'flight.close',
  RotationWasCreated = 'rotation.created',
  RotationWasSetAsCurrent = 'rotation.set-current',
  RotationWasCleared = 'rotation.cleared',
}

export type FlightWasCheckedInPayload = {
  flightId: string;
  userId: string;
};

export type FlightWasClosedPayload = {
  userId: string;
};

export type RotationWasCreatedPayload = {
  rotationId: string;
  userId: string;
};

export type RotationWasSetAsCurrentPayload = {
  rotationId: string;
  userId: string;
};

export type RotationWasClearedPayload = {
  userId: string;
};
