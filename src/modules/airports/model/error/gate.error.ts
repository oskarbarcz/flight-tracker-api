import { NotFoundException } from '@nestjs/common';

export class GateNotFoundError extends NotFoundException {
  constructor() {
    super('Gate with given id does not exist.');
  }
}
