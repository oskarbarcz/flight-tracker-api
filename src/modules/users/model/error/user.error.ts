import { BadRequestException, NotFoundException } from '@nestjs/common';

export class UserNotFoundError extends NotFoundException {
  constructor() {
    super('User with given id does not exist.');
  }
}

export class UserEmailAlreadyExistsError extends BadRequestException {
  constructor() {
    super('User with given email already exists.');
  }
}

export class OnlyCabinCrewCanHavePilotLicenseError extends BadRequestException {
  constructor() {
    super('Only CabinCrew can have a pilot license ID.');
  }
}

export class OnlyCabinCrewCanHaveHomeAirportError extends BadRequestException {
  constructor() {
    super('Only CabinCrew can have a home airport.');
  }
}

export class CabinCrewMustHaveHomeAirportError extends BadRequestException {
  constructor() {
    super('CabinCrew must have a home airport.');
  }
}
