import { NotFoundException } from '@nestjs/common';

export class AirportNotFoundError extends NotFoundException {
  constructor() {
    super('Airport with given id does not exist.');
  }
}
