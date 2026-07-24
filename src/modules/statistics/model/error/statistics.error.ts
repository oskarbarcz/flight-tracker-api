import { BadRequestError } from '../../../../core/errors/domain-error';

export class InvalidActivityRangeError extends BadRequestError {
  constructor() {
    super('The activity range "from" date must be on or before the "to" date.');
  }
}
