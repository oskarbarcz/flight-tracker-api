import { BadRequestException, ForbiddenException } from '@nestjs/common';

export class OnlyCabinCrewCanTravelError extends BadRequestException {
  constructor() {
    super('Only CabinCrew can travel.');
  }
}

export class TravelDestinationEqualsOriginError extends BadRequestException {
  constructor() {
    super('Travel destination must differ from the current airport.');
  }
}

export class UserHasNoCurrentAirportError extends BadRequestException {
  constructor() {
    super('User has no current airport to travel from.');
  }
}

export class CannotAccessOtherUsersTravelError extends ForbiddenException {
  constructor() {
    super('User is not allowed to access another user travel.');
  }
}
