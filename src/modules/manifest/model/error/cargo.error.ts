import {
  ForbiddenError,
  NotFoundError,
  UnprocessableError,
} from '../../../../core/errors/domain-error';

export class HoldLayoutNotFoundError extends NotFoundError {
  constructor(type: string) {
    super(`No hold configuration is known for airframe type ${type}.`);
  }
}

export class HoldVariantNotFoundError extends NotFoundError {
  constructor(type: string, variant: string) {
    super(`Airframe type ${type} does not offer hold variant ${variant}.`);
  }
}

export class HoldWeightCapacityExceededError extends UnprocessableError {
  constructor(cargoKg: number, capacityKg: number) {
    super(
      `Cannot load ${cargoKg} kg of cargo into a hold that carries ${capacityKg} kg.`,
    );
  }
}

export class HoldVolumeCapacityExceededError extends UnprocessableError {
  constructor(cargoKg: number, volumeM3: number) {
    super(
      `Cannot load ${cargoKg} kg of cargo into a hold of ${volumeM3} cubic metres at any plausible density.`,
    );
  }
}

export class HoldCannotPlaceLoadError extends UnprocessableError {
  constructor(unplacedKg: number, dimension: 'weight' | 'volume') {
    super(
      `Cannot place ${unplacedKg} kg of the load: the hold has no ${dimension} left for it.`,
    );
  }
}

export class CargoManifestNotGeneratedError extends NotFoundError {
  constructor() {
    super(
      'Flight has no cargo manifest yet. It is generated when the flight is released to the pilot.',
    );
  }
}

export class CargoManifestReadableByCaptainOnlyError extends ForbiddenError {
  constructor() {
    super(
      'Cabin crew can only read the cargo manifest of a flight they captain.',
    );
  }
}

export class RetainedCargoExceedsFinalTonnageError extends UnprocessableError {
  constructor(cargoKg: number, retainedKg: number) {
    super(
      `Cannot reduce the load to ${cargoKg} kg while ${retainedKg} kg aboard may not be offloaded.`,
    );
  }
}
