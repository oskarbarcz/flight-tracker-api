import { ApiProperty } from '@nestjs/swagger';
import {
  ChangeRequestResource,
  ChangeRequestStatus,
} from 'prisma/client/client';
import { AirportValues } from './airport-change.model';
import { ParkingPositionValues } from './parking-position-change.model';
import { GateValues } from './gate-change.model';
import { TerminalValues } from './terminal-change.model';
import { RunwayValues } from './runway-change.model';

export { ChangeRequestResource, ChangeRequestStatus };

type EveryResource<T extends Record<ChangeRequestResource, object>> = T;

export type ChangeRequestValues = EveryResource<{
  airport: AirportValues;
  parkingPosition: ParkingPositionValues;
  gate: GateValues;
  terminal: TerminalValues;
  runway: RunwayValues;
}>;

export type ChangeRequestChanges<
  R extends ChangeRequestResource = ChangeRequestResource,
> = Partial<ChangeRequestValues[R]>;

export class ChangeRequestParticipant {
  @ApiProperty({
    description: 'User unique system identifier.',
    example: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
  })
  id!: string;

  @ApiProperty({
    description: 'User first and last name.',
    example: 'Rick Doe',
  })
  name!: string;
}

export class ChangedField {
  @ApiProperty({
    description: 'Name of the field the user data change request touches.',
    example: 'name',
  })
  field!: string;

  @ApiProperty({
    description: 'Value the record holds now, read when the request is made.',
    example: 'Warsaw Chopin',
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'object' },
      { type: 'array', items: {} },
    ],
    nullable: true,
  })
  current!: unknown;

  @ApiProperty({
    description: 'Value the user data change request proposes.',
    example: 'Warsaw Chopin Airport',
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'object' },
      { type: 'array', items: {} },
    ],
    nullable: true,
  })
  proposed!: unknown;
}

export class ChangeRequest {
  @ApiProperty({
    description: 'User data change request unique system identifier.',
    example: 'acd93eae-b731-4794-9060-b7652bbc9905',
  })
  id!: string;

  @ApiProperty({
    description: 'Kind of data the user data change request targets.',
    example: ChangeRequestResource.airport,
    enum: ChangeRequestResource,
  })
  resource!: ChangeRequestResource;

  @ApiProperty({
    description: 'Unique system identifier of the record the change targets.',
    example: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
  })
  targetId!: string;

  @ApiProperty({
    description:
      'Proposed values, keyed by field. Only the fields the requester wants to change are present.',
    type: 'object',
    additionalProperties: true,
    example: { name: 'Warsaw Chopin Airport' },
  })
  changes!: ChangeRequestChanges;

  @ApiProperty({
    description:
      '`pending` until a reviewer decides or the requester withdraws it; `accepted` once applied; `rejected` when turned down; `withdrawn` when the requester took it back.',
    example: ChangeRequestStatus.pending,
    enum: ChangeRequestStatus,
  })
  status!: ChangeRequestStatus;

  @ApiProperty({
    description: 'Cabin crew member who proposed the change.',
    type: ChangeRequestParticipant,
  })
  requestedBy!: ChangeRequestParticipant;

  @ApiProperty({
    description:
      'Reviewer who accepted or rejected the change. `null` while pending or once withdrawn.',
    type: ChangeRequestParticipant,
    nullable: true,
  })
  decidedBy!: ChangeRequestParticipant | null;

  @ApiProperty({
    description:
      'Reason the reviewer gave when rejecting. `null` unless rejected.',
    example: 'Boston is in North America.',
    nullable: true,
    type: String,
  })
  rejectionReason!: string | null;

  @ApiProperty({
    description:
      'Time the change was accepted, rejected or withdrawn. `null` while pending.',
    example: '2026-09-02T10:00:00.000Z',
    nullable: true,
    type: 'string',
  })
  decidedAt!: Date | null;

  @ApiProperty({
    description: 'Server-recorded time the change was proposed.',
    example: '2026-09-01T10:00:00.000Z',
  })
  createdAt!: Date;
}

export class ChangeRequestWithFields extends ChangeRequest {
  @ApiProperty({
    description:
      'Every field the change touches, with the value held now beside the proposed one.',
    type: [ChangedField],
  })
  fields!: ChangedField[];
}

export type TypedChangeRequest<R extends ChangeRequestResource> = Omit<
  ChangeRequest,
  'resource' | 'changes'
> & {
  resource: R;
  changes: ChangeRequestChanges<R>;
};

export type AnyChangeRequest = {
  [R in ChangeRequestResource]: TypedChangeRequest<R>;
}[ChangeRequestResource];
