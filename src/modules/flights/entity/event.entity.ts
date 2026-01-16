import { ApiProperty } from '@nestjs/swagger';
import { FlightEventType } from '../../../core/events/flight';
import { InputJsonValue } from '../../../../prisma/client/internal/prismaNamespace';

export enum FlightEventScope {
  System = 'system',
  Operations = 'operations',
  User = 'user',
}

export class EventActor {
  @ApiProperty({
    description: 'User unique system identifier',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
  })
  id!: string;

  @ApiProperty({
    description: 'User first and last name',
    example: 'John Doe',
  })
  name!: string;
}

export class FlightEvent<EventPayload = object> {
  @ApiProperty({
    description: 'Event unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Event scope',
    enum: FlightEventScope,
    example: FlightEventScope.User,
  })
  scope!: FlightEventScope;

  @ApiProperty({
    description: 'Event type',
    enum: FlightEventType,
    example: FlightEventType.FlightWasCreated,
  })
  type!: FlightEventType;

  @ApiProperty({
    description: 'Event payload',
    example: {},
  })
  payload?: EventPayload & (InputJsonValue | undefined);

  @ApiProperty({
    description: 'Flight associated with the event',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  flightId!: string;

  @ApiProperty({
    description: 'User caused event generation',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  actorId!: string | null;

  @ApiProperty({
    description: 'User caused event generation',
    type: EventActor,
    nullable: true,
  })
  actor!: EventActor | null;

  @ApiProperty({
    description: 'Event creation date',
    example: '2025-01-01T00:00:00Z',
  })
  createdAt!: Date;

  rotationId?: string | null = null;
}
