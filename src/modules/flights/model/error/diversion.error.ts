import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

export class DiversionNotFoundError extends NotFoundException {
  constructor() {
    super('Diversion was not reported for this flight.');
  }
}

export class ActiveDiversionAlreadyExistsError extends ConflictException {
  constructor() {
    super('Active diversion already exists for this flight');
  }
}

export class InvalidStatusToReportDiversionError extends BadRequestException {
  constructor() {
    super(
      'Diversion can be reported to flights in Taxiing Out or In Cruise status only',
    );
  }
}
