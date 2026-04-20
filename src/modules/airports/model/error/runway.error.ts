import { NotFoundException } from '@nestjs/common';

export class RunwayNotFoundError extends NotFoundException {
  constructor() {
    super('Runway with given id does not exist.');
  }
}
