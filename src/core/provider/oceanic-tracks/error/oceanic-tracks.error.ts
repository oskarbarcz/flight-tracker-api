import { BadGatewayError } from '../../../errors/domain-error';

export class OceanicTracksUnavailableError extends BadGatewayError {
  constructor() {
    super('Oceanic tracks are unavailable.');
  }
}
