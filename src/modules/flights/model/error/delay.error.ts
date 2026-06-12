import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class DelayRequestNotFoundError extends NotFoundException {
  constructor() {
    super('This flight has no delay request.');
  }
}

export class DelayReportNotFoundError extends NotFoundException {
  constructor() {
    super(
      'Delay allocation report with given id does not exist for this flight.',
    );
  }
}

export class DelayReportAlreadyAcceptedError extends ConflictException {
  constructor() {
    super(
      'This delay allocation report has already been accepted and is frozen.',
    );
  }
}

export class FlightHasUnacceptedDelayError extends UnprocessableEntityException {
  constructor() {
    super(
      'Cannot close flight: its delay must be fully allocated and every report accepted.',
    );
  }
}
