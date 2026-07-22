import { OmitType } from '@nestjs/swagger';
import { FlightEvent } from '../../../model/event.model';
import {
  FlightEventPayload,
  FlightEventType,
} from '../../../../../core/domain/events/dto/flight.events';

export class FlightEventResponse extends OmitType(FlightEvent, [
  'actorId',
  'flightId',
]) {}

export type FlightBroadcastEvent = FlightEventPayload & {
  type: FlightEventType;
};
