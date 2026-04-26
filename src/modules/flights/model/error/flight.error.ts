import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class FlightNotFoundError extends NotFoundException {
  constructor() {
    super('Flight with given ID not found.');
  }
}

export class FlightDoesNotExistError extends NotFoundException {
  constructor() {
    super('Flight with given id does not exist.');
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
    super('Flight is in incorrect state to modify its rotation.');
  }
}

export class InvalidStatusToUpdateDepartureGateError extends UnprocessableEntityException {
  constructor() {
    super('Cannot update departure gate, because pilot is already checked in.');
  }
}

export class InvalidStatusToUpdateDepartureRunwayError extends UnprocessableEntityException {
  constructor() {
    super('Cannot update departure runway after takeoff.');
  }
}
