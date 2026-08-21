import {
  BadRequestError,
  ConflictError,
} from '../../../../core/errors/domain-error';

export class AirportOsmPullRequiredError extends ConflictError {
  constructor() {
    super(
      'No OpenStreetMap data is held for this airport. Pull it and review the proposal before pushing.',
    );
  }
}

export class UnknownProposedChangesError extends BadRequestError {
  constructor(keys: string[]) {
    super(
      `The retained OpenStreetMap data proposes no such change: ${keys.join(', ')}. Pull again to get current change keys.`,
    );
  }
}
