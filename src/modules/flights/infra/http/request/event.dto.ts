import { OmitType } from '@nestjs/swagger';
import { FlightEvent } from '../../../model/event.model';

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
