import { ConflictException, NotFoundException } from '@nestjs/common';

export class FlightNotFoundError extends NotFoundException {
  constructor() {
    super('Flight with given ID not found.');
  }
}

export class FlightAlreadyAssignedToRotationError extends ConflictException {
  constructor() {
    super('Flight is already assigned to rotation.');
  }
}

export class FlightIncorrectStateToAddToRotationError extends ConflictException {
  constructor() {
    super('Flight is in incorrect state to be added to rotation.');
  }
}
