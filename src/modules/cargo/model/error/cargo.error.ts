import { NotFoundError } from '../../../../core/errors/domain-error';

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
