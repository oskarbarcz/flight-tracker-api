import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class InvalidStatusToDeclareEmergencyError extends UnprocessableEntityException {
  constructor() {
    super(
      'Emergency can only be declared between off-block and on-block reports.',
    );
  }
}

export class ActiveEmergencyAlreadyExistsError extends ConflictException {
  constructor() {
    super(
      'This flight already has an active emergency. Resolve it before declaring another.',
    );
  }
}

export class EmergencyNotFoundError extends NotFoundException {
  constructor() {
    super('Emergency with given id was not declared for this flight.');
  }
}

export class EmergencyAlreadyResolvedError extends UnprocessableEntityException {
  constructor() {
    super('This emergency has already been resolved.');
  }
}
