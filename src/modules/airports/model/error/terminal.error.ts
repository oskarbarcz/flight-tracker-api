import { NotFoundException } from '@nestjs/common';

export class TerminalNotFoundError extends NotFoundException {
  constructor() {
    super('Terminal with given id does not exist.');
  }
}
