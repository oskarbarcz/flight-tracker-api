import { ApiProperty } from '@nestjs/swagger';

export enum FlightEventType {
  FlightWasCreated = 'flight_created',
}

export enum FlightEventScope {
  System = 'system',
  Operations = 'operations',
  User = 'user',
}

export class FlightEvent {
  @ApiProperty({
    description: 'Event unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Event scope',
    enum: FlightEventScope,
    example: FlightEventScope.User,
  })
  scope: FlightEventScope;

  @ApiProperty({
    description: 'Event type',
    enum: FlightEventType,
    example: FlightEventType.FlightWasCreated,
  })
  type: FlightEventType;

  @ApiProperty({
    description: 'Event payload',
    example: {},
  })
  payload: object;

  @ApiProperty({
    description: 'Flight associated with the event',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  flightId: string;

  @ApiProperty({
    description: 'User caused event generation',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  actorId: string | null;

  @ApiProperty({
    description: 'Event creation date',
    example: '2025-01-01T00:00:00Z',
  })
  createdAt: Date;
}
