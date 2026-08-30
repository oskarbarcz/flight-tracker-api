import { OmitType } from '@nestjs/swagger';
import { EventActor, FlightEvent } from '../../../model/event.model';
import {
  FlightEventScope,
  FlightEventType,
} from '../../../../../core/domain/events/dto/flight.events';

export class FlightEventResponse extends OmitType(FlightEvent, [
  'actorId',
  'flightId',
]) {}

export type RecordedFlightEvent = {
  id: string;
  scope: string;
  type: string;
  payload: unknown;
  actor: EventActor | null;
  createdAt: Date;
};

export const toFlightEventResponse = (
  event: RecordedFlightEvent,
): FlightEventResponse => ({
  id: event.id,
  scope: event.scope as FlightEventScope,
  type: event.type as FlightEventType,
  payload: event.payload as object,
  actor: event.actor,
  createdAt: event.createdAt,
});
