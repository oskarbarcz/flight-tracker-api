import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../../core/errors/domain-error';

export class DiscordAccountLinkedToAnotherUserError extends ConflictError {
  constructor() {
    super('Discord account is already linked to another user.');
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('User with given id does not exist.');
  }
}

export class UserWithGivenIdNotFoundError extends NotFoundError {
  constructor() {
    super('User with given ID not found');
  }
}

export class UserEmailAlreadyExistsError extends BadRequestError {
  constructor() {
    super('User with given email already exists.');
  }
}

export class OnlyCabinCrewCanHavePilotLicenseError extends BadRequestError {
  constructor() {
    super('Only CabinCrew can have a pilot license ID.');
  }
}

export class OnlyCabinCrewCanHaveHomeAirportError extends BadRequestError {
  constructor() {
    super('Only CabinCrew can have a home airport.');
  }
}

export class CabinCrewMustHaveHomeAirportError extends BadRequestError {
  constructor() {
    super('CabinCrew must have a home airport.');
  }
}

export class GoogleAccountLinkedToAnotherUserError extends ConflictError {
  constructor() {
    super('This Google account is already linked to another user.');
  }
}

export class UserAlreadyHasLinkedGoogleAccountError extends ConflictError {
  constructor() {
    super('User already has a linked Google account.');
  }
}

export class UserHasNoLinkedGoogleAccountError extends ConflictError {
  constructor() {
    super('User has no linked Google account.');
  }
}

export class ListUsersForbiddenError extends ForbiddenError {
  constructor() {
    super('Forbidden');
  }
}
