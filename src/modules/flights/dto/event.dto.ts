import { OmitType } from '@nestjs/swagger';
import { FlightEvent } from '../entity/event.entity';

export class NewFlightEvent extends OmitType(FlightEvent, [
  'id',
  'createdAt',
  'actor',
]) {}

export class FlightEventResponse extends OmitType(FlightEvent, [
  'actorId',
  'flightId',
  'rotationId',
]) {}
