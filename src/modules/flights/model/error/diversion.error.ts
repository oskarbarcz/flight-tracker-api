import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../../core/errors/domain-error';

export class DiversionNotFoundError extends NotFoundError {
  constructor() {
    super('Diversion was not reported for this flight.');
  }
}

export class ActiveDiversionAlreadyExistsError extends ConflictError {
  constructor() {
    super('Active diversion already exists for this flight');
  }
}

export class InvalidStatusToReportDiversionError extends BadRequestError {
  constructor() {
    super(
      'Diversion can be reported to flights in Taxiing Out or In Cruise status only',
    );
  }
}
