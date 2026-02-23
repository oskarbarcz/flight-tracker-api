import { ConflictException, NotFoundException } from '@nestjs/common';

export class AircraftNotFoundError extends NotFoundException {
  constructor() {
    super('Aircraft with given ID not found.');
  }
}

export class AircraftInUseError extends ConflictException {
  constructor() {
    super('Aircraft is related to other resources and cannot be removed.');
  }
}
