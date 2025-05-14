import { BadRequestException, NotFoundException } from '@nestjs/common';

export class RotationDoesNotExistError extends NotFoundException {
  constructor(id: string) {
    super(`Rotation with id ${id} does not exist.`);
  }
}

export class FlightDoesNotExistError extends NotFoundException {
  constructor(id: string) {
    super(`Flight with id ${id} does not exist.`);
  }
}

export class FlightAlreadyInRotationError extends BadRequestException {
  constructor(flightId: string, rotationId: string) {
    super(`Flight with id ${flightId} is already in rotation with id ${rotationId}.`);
  }
}

export class UserDoesNotOwnRotationError extends BadRequestException {
  constructor(userId: string, rotationId: string) {
    super(`User with id ${userId} does not own rotation with id ${rotationId}.`);
  }
}

export class UserAlreadyHasCurrentRotationError extends BadRequestException {
  constructor(userId: string, rotationId: string) {
    super(`User with id ${userId} already has current rotation with id ${rotationId}.`);
  }
}