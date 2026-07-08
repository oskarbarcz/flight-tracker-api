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

export class InvalidStatusToUpdateDepartureParkingPositionError extends UnprocessableEntityException {
  constructor() {
    super(
      'Cannot update departure parking position, because pilot is already checked in.',
    );
  }
}

export class InvalidStatusToUpdateDepartureRunwayError extends UnprocessableEntityException {
  constructor() {
    super('Cannot update departure runway after takeoff.');
  }
}

export class InvalidStatusToUpdateArrivalParkingPositionError extends UnprocessableEntityException {
  constructor() {
    super(
      'Cannot update arrival parking position after on-block was reported.',
    );
  }
}

export class InvalidStatusToUpdateArrivalRunwayError extends UnprocessableEntityException {
  constructor() {
    super('Cannot update arrival runway after taxiing in.');
  }
}

export class InvalidStatusToPredictOffBlockError extends UnprocessableEntityException {
  constructor() {
    super(
      'Cannot update predicted off-block time after flight has reported off-block.',
    );
  }
}

export class InvalidStatusToPredictTakeoffError extends UnprocessableEntityException {
  constructor() {
    super(
      'Cannot update predicted takeoff time after flight has reported takeoff.',
    );
  }
}

export class InvalidStatusToPredictArrivalError extends UnprocessableEntityException {
  constructor() {
    super(
      'Cannot update predicted arrival time after flight has reported arrival.',
    );
  }
}

export class InvalidStatusToPredictOnBlockError extends UnprocessableEntityException {
  constructor() {
    super(
      'Cannot update predicted on-block time after flight has reported on-block.',
    );
  }
}

export class InvalidStatusToModifyCrewError extends UnprocessableEntityException {
  constructor() {
    super('Cannot assign or unassign crew after boarding has finished.');
  }
}
