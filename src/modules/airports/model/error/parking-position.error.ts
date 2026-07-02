import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class ParkingPositionNotFoundError extends NotFoundException {
  constructor() {
    super('Parking position with given id does not exist.');
  }
}

export class ParkingPositionNotAtAirportError extends UnprocessableEntityException {
  constructor() {
    super('Parking position does not belong to the given airport.');
  }
}
