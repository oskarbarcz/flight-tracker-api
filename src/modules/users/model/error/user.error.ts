import { NotFoundException } from '@nestjs/common';

export class UserNotFoundError extends NotFoundException {
  constructor() {
    super('User with given ID not found.');
  }
}
