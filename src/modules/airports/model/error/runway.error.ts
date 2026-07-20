import {
  NotFoundError,
  UnprocessableError,
} from '../../../../core/errors/domain-error';

export class RunwayNotFoundError extends NotFoundError {
  constructor() {
    super('Runway with given id does not exist.');
  }
}

export class RunwayNotAtAirportError extends UnprocessableError {
  constructor() {
    super('Runway does not belong to the given airport.');
  }
}
