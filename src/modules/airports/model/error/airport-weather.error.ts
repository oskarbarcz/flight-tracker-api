import { NotFoundException } from '@nestjs/common';

export class AirportWeatherNotFoundError extends NotFoundException {
  constructor() {
    super('Weather for given airport does not exist.');
  }
}
