import { OmitType } from '@nestjs/swagger';
import { FlightEvent } from '../entities/event.entity';

export class FlightEventResponse extends OmitType(FlightEvent, [
  'actorId',
  'flightId',
]) {}
