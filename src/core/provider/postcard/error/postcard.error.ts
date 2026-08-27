import {
  BadGatewayError,
  UnprocessableError,
} from '../../../errors/domain-error';

export class PostcardRejectedError extends UnprocessableError {
  constructor(reason: string) {
    super(`Postcard generator rejected the request: ${reason}`);
  }
}

export class PostcardGeneratorUnavailableError extends BadGatewayError {
  constructor() {
    super('Postcard generator is unavailable.');
  }
}
