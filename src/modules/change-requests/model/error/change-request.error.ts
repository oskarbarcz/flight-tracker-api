import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnprocessableError,
} from '../../../../core/errors/domain-error';

export class ChangeRequestNotFoundError extends NotFoundError {
  constructor() {
    super('Change request with given id does not exist.');
  }
}

export class ChangeRequestTargetNotFoundError extends NotFoundError {
  constructor() {
    super('The record this change request targets no longer exists.');
  }
}

export class ChangeRequestNotPendingError extends ConflictError {
  constructor() {
    super('This change request has already been decided or withdrawn.');
  }
}

export class EmptyChangeRequestError extends BadRequestError {
  constructor() {
    super('A change request must propose at least one field.');
  }
}

export class NothingToChangeError extends UnprocessableError {
  constructor() {
    super('Every proposed value is equal to the value held now.');
  }
}

export class NotChangeRequestOwnerError extends ForbiddenError {
  constructor() {
    super('Only the requester may withdraw this change request.');
  }
}
