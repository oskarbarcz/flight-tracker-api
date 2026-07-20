import {
  NotFoundError,
  UnprocessableError,
} from '../../../../core/errors/domain-error';

export class ParkingPositionNotFoundError extends NotFoundError {
  constructor() {
    super('Parking position with given id does not exist.');
  }
}

export class ParkingPositionNotAtAirportError extends UnprocessableError {
  constructor() {
    super('Parking position does not belong to the given airport.');
  }
}
