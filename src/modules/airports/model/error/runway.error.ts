import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class RunwayNotFoundError extends NotFoundException {
  constructor() {
    super('Runway with given id does not exist.');
  }
}

export class RunwayNotAtAirportError extends UnprocessableEntityException {
  constructor() {
    super('Runway does not belong to the given airport.');
  }
}
