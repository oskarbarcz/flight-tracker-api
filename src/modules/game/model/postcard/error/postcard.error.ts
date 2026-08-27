import {
  ConflictError,
  NotFoundError,
} from '../../../../../core/errors/domain-error';

export class PostcardNotFoundError extends NotFoundError {
  constructor() {
    super('Postcard with given id does not exist.');
  }
}

export class PostcardArtAlreadyBeingDrawnError extends ConflictError {
  constructor() {
    super('Postcard art is already being drawn.');
  }
}
