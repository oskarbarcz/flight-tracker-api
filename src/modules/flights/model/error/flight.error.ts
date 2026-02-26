import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

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

export class FlightRotationNotMatchingError extends ConflictException {
  constructor() {
    super('Flight is already assigned to a different rotation.');
  }
}

export class FlightIncorrectStateToChangeRotationError extends BadRequestException {
  constructor() {
    super('Flight is in incorrect state to be modify its rotation.');
  }
}
