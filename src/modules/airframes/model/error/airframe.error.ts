import { NotFoundException } from '@nestjs/common';

export class AirframeNotFoundError extends NotFoundException {
  constructor() {
    super('Airframe with given type not found.');
  }
}
