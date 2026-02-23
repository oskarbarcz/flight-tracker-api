import { ConflictException, NotFoundException } from '@nestjs/common';

export class OperatorNotFoundError extends NotFoundException {
  constructor() {
    super('Operator with given ID not found.');
  }
}

export class OperatorWithIcaoCodeNotFoundError extends NotFoundException {
  constructor() {
    super('Operator with given ICAO code not found.');
  }
}

export class OperatorAlreadyExistsError extends ConflictException {
  constructor() {
    super('Operator with given ICAO code already exists.');
  }
}

export class OperatorInUseError extends ConflictException {
  constructor() {
    super('Operator is related to other resources and cannot be removed.');
  }
}
