import { NotFoundException } from '@nestjs/common';

export class RotationNotFoundError extends NotFoundException {
  constructor() {
    super('Rotation with given ID not found.');
  }
}
