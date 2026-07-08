import { ConflictException, NotFoundException } from '@nestjs/common';

export class CrewNotFoundError extends NotFoundException {
  constructor() {
    super('Crew member with given ID not found.');
  }
}

export class CrewOperatorMismatchError extends ConflictException {
  constructor() {
    super('Crew member does not belong to the flight operator.');
  }
}
