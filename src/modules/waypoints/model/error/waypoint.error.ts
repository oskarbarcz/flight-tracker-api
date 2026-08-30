import { NotFoundException } from '@nestjs/common';

export class WaypointNotFoundError extends NotFoundException {
  constructor() {
    super('Waypoint with given identifier is not known.');
  }
}
