import {
  ForbiddenError,
  NotFoundError,
} from '../../../../core/errors/domain-error';

export class NotocNotIssuedError extends NotFoundError {
  constructor() {
    super(
      'Flight has no notification to captain yet. It is issued from the preliminary loadsheet.',
    );
  }
}

export class NotocReadableByCaptainOnlyError extends ForbiddenError {
  constructor() {
    super(
      'Cabin crew can only read the notification to captain of a flight they captain.',
    );
  }
}
