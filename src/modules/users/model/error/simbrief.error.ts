import { BadRequestError } from '../../../../core/errors/domain-error';

export class InvalidSimbriefUserIdError extends BadRequestError {
  constructor() {
    super('SimBrief account with given ID does not exist.');
  }
}
