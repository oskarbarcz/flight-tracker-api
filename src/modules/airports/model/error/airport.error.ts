import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../../core/errors/domain-error';

export class AirportNotFoundError extends NotFoundError {
  constructor() {
    super('Airport with given id does not exist.');
  }
}

export class AirportInUseError extends ConflictError {
  constructor() {
    super('Cannot remove airport that is already in use by any of flights.');
  }
}

export class AirportByIcaoCodeNotFoundError extends NotFoundError {
  constructor() {
    super('Airport with given ICAO code does not exist.');
  }
}

export class AirportIcaoAlreadyExistsError extends BadRequestError {
  constructor() {
    super('Aircraft with given ICAO code already exists.');
  }
}
