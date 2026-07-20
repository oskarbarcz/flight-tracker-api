import {
  ConflictError,
  NotFoundError,
} from '../../../../core/errors/domain-error';

export class CrewNotFoundError extends NotFoundError {
  constructor() {
    super('Crew member with given ID not found.');
  }
}

export class CrewOperatorMismatchError extends ConflictError {
  constructor() {
    super('Crew member does not belong to the flight operator.');
  }
}
