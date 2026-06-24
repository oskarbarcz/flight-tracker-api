import { BadRequestException } from '@nestjs/common';

export class RepositionDestinationEqualsOriginError extends BadRequestException {
  constructor() {
    super('Reposition destination must differ from the current airport.');
  }
}

export class AircraftHasNoCurrentAirportError extends BadRequestException {
  constructor() {
    super('Aircraft has no current airport to reposition from.');
  }
}
