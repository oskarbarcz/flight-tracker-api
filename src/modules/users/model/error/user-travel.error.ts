import {
  BadRequestError,
  ForbiddenError,
} from '../../../../core/errors/domain-error';

export class OnlyCabinCrewCanTravelError extends BadRequestError {
  constructor() {
    super('Only CabinCrew can travel.');
  }
}

export class TravelDestinationEqualsOriginError extends BadRequestError {
  constructor() {
    super('Travel destination must differ from the current airport.');
  }
}

export class UserHasNoCurrentAirportError extends BadRequestError {
  constructor() {
    super('User has no current airport to travel from.');
  }
}

export class CannotAccessOtherUsersTravelError extends ForbiddenError {
  constructor() {
    super('User is not allowed to access another user travel.');
  }
}
