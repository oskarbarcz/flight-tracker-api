import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
} from '../../../../core/errors/domain-error';

export class DelayRequestNotFoundError extends NotFoundError {
  constructor() {
    super('This flight has no delay request.');
  }
}

export class DelayReportNotFoundError extends NotFoundError {
  constructor() {
    super(
      'Delay allocation report with given id does not exist for this flight.',
    );
  }
}

export class DelayReportAlreadyAcceptedError extends ConflictError {
  constructor() {
    super(
      'This delay allocation report has already been accepted and is frozen.',
    );
  }
}

export class FlightHasUnacceptedDelayError extends UnprocessableError {
  constructor() {
    super(
      'Cannot close flight: its delay must be fully allocated and every report accepted.',
    );
  }
}
