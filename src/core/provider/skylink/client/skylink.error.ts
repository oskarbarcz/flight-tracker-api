import { ConflictError, NotFoundError } from '../../../errors/domain-error';

export class SkylinkAirportNotFoundError extends NotFoundError {
  constructor(label: string, code: string) {
    super(`No airport found for ${label} code: ${code}`);
  }
}

export class MultipleSkylinkAirportsFoundError extends ConflictError {
  constructor(label: string, code: string) {
    super(`Multiple airports found for ${label} code: ${code}`);
  }
}
