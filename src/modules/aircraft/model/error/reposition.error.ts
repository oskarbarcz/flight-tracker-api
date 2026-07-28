import { BadRequestError } from '../../../../core/errors/domain-error';

export class RepositionDestinationEqualsOriginError extends BadRequestError {
  constructor() {
    super('Reposition destination must differ from the current airport.');
  }
}

export class AircraftHasNoCurrentAirportError extends BadRequestError {
  constructor() {
    super('Aircraft has no current airport to reposition from.');
  }
}
