import { FlightStatus } from './flight.model';
import { InvalidStatusToModifyCrewError } from './error/flight.error';

const CREW_MODIFIABLE_STATUSES = [
  FlightStatus.Created,
  FlightStatus.Ready,
  FlightStatus.CheckedIn,
  FlightStatus.BoardingStarted,
];

export function assertCrewIsModifiable(status: FlightStatus): void {
  if (!CREW_MODIFIABLE_STATUSES.includes(status)) {
    throw new InvalidStatusToModifyCrewError();
  }
}
