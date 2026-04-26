import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class GateNotFoundError extends NotFoundException {
  constructor() {
    super('Gate with given id does not exist.');
  }
}

export class GateNotAtAirportError extends UnprocessableEntityException {
  constructor() {
    super('Gate does not belong to the given airport.');
  }
}
