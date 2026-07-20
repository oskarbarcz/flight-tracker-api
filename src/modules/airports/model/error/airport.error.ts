import { NotFoundException } from '@nestjs/common';
import { ConflictError } from '../../../../core/errors/domain-error';

export class AirportNotFoundError extends NotFoundException {
  constructor() {
    super('Airport with given id does not exist.');
  }
}

export class AirportInUseError extends ConflictError {
  constructor() {
    super('Cannot remove airport that is already in use by any of flights.');
  }
}
