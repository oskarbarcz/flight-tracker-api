import { ApiProperty } from '@nestjs/swagger';

export enum ProposedStatus {
  Added = 'added',
  Removed = 'removed',
  Updated = 'updated',
  NotChanged = 'not-changed',
}

export enum ProposedResource {
  Airport = 'airport',
  Runway = 'runway',
  Terminal = 'terminal',
  ParkingPosition = 'parkingPosition',
  Gate = 'gate',
}

export enum PushOutcome {
  Added = 'added',
  Removed = 'removed',
  Updated = 'updated',
  Skipped = 'skipped',
  Failed = 'failed',
}

export class ProposedFieldChange {
  @ApiProperty({
    description: 'Field of the record this change would write',
    example: 'length',
  })
  field!: string;

  @ApiProperty({
    description:
      'Value the airport model holds today. Null for a record that does not exist yet.',
    example: 2037,
    nullable: true,
  })
  current!: unknown;

  @ApiProperty({
    description: 'Value OpenStreetMap reports',
    example: 2100,
  })
  proposed!: unknown;
}

export class ProposedChange {
  @ApiProperty({
    description:
      'Stable identifier of this change, quoted back when selecting what to push. Formed as `<resource>:<label>`.',
    example: 'runway:09',
  })
  key!: string;

  @ApiProperty({
    description: 'Kind of record this change concerns',
    enum: ProposedResource,
    example: ProposedResource.Runway,
  })
  resource!: ProposedResource;

  @ApiProperty({
    description:
      'How the record is identified within the airport — a runway designator, a terminal short name, a stand or gate name, or the airport field itself',
    example: '09',
  })
  label!: string;

  @ApiProperty({
    description:
      'How OpenStreetMap now stands against the airport model. `added` and `updated` write; `removed` means the airport holds a record OpenStreetMap no longer reports, and pushing it deletes that record; `not-changed` is reported so the review shows the whole airport, and pushing it does nothing.',
    enum: ProposedStatus,
    example: ProposedStatus.Updated,
  })
  status!: ProposedStatus;

  @ApiProperty({
    description:
      'Every field this change would write, with the value held today beside the value OpenStreetMap reports. Empty for a record that is unchanged or being removed.',
    type: [ProposedFieldChange],
  })
  fields!: ProposedFieldChange[];

  @ApiProperty({
    description:
      'Other changes that have to be pushed alongside this one for it to be applicable. Adding a stand needs its terminal and a gate needs both; removing a terminal needs the stands and gates on it gone first.',
    type: [String],
    example: ['terminal:HT'],
  })
  requires!: string[];
}

export class ProposalSummary {
  @ApiProperty({ description: 'Records OpenStreetMap would add', example: 4 })
  added!: number;

  @ApiProperty({
    description:
      'Records the airport holds that OpenStreetMap no longer reports',
    example: 1,
  })
  removed!: number;

  @ApiProperty({
    description: 'Records OpenStreetMap would change',
    example: 3,
  })
  updated!: number;

  @ApiProperty({
    description: 'Records OpenStreetMap agrees with already',
    example: 3,
  })
  notChanged!: number;
}

export class AirportOsmProposal {
  @ApiProperty({
    description: 'Airport unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  airportId!: string;

  @ApiProperty({ description: 'Airport ICAO code', example: 'EDDW' })
  icaoCode!: string;

  @ApiProperty({
    description: 'Where the proposed values come from',
    example: 'OpenStreetMap via Overpass',
  })
  source!: string;

  @ApiProperty({
    description:
      'Name OpenStreetMap gives the aerodrome. Reported for orientation only — the airport name is never overwritten from OpenStreetMap.',
    example: 'Bremen Airport',
    nullable: true,
  })
  providerName!: string | null;

  @ApiProperty({
    description: 'When the underlying data was read from OpenStreetMap',
    example: '2026-08-21T14:12:03.000Z',
  })
  pulledAt!: string;

  @ApiProperty({
    description:
      'Whether this answer reused an earlier read instead of querying OpenStreetMap again. Overpass is a free service with a usage policy, so a repeated review is served from the retained pull unless a refresh is asked for.',
    example: false,
  })
  fromCache!: boolean;

  @ApiProperty({ type: ProposalSummary })
  summary!: ProposalSummary;

  @ApiProperty({
    description:
      'Every difference between OpenStreetMap and the airport model, grouped by resource: the airport itself, then runways, terminals, parking positions and gates',
    type: [ProposedChange],
  })
  changes!: ProposedChange[];
}

export class PushedChange {
  @ApiProperty({
    description: 'Identifier of the selected change',
    example: 'runway:09',
  })
  key!: string;

  @ApiProperty({
    description: 'What happened to it',
    enum: PushOutcome,
    example: PushOutcome.Updated,
  })
  outcome!: PushOutcome;

  @ApiProperty({
    description:
      'Why a change was skipped or failed. Absent when it was applied.',
    example: 'Requires terminal HT, which does not exist and was not selected.',
    required: false,
    nullable: true,
  })
  reason?: string | null;
}

export class PushTotals {
  @ApiProperty({ description: 'Records created', example: 3 })
  added!: number;

  @ApiProperty({ description: 'Records deleted', example: 1 })
  removed!: number;

  @ApiProperty({ description: 'Records updated', example: 2 })
  updated!: number;

  @ApiProperty({
    description: 'Selected changes that turned out to need no write',
    example: 1,
  })
  skipped!: number;

  @ApiProperty({
    description: 'Selected changes that could not be applied',
    example: 0,
  })
  failed!: number;
}

export class AirportOsmPushResult {
  @ApiProperty({
    description: 'Airport unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  airportId!: string;

  @ApiProperty({ description: 'Airport ICAO code', example: 'EDDW' })
  icaoCode!: string;

  @ApiProperty({ type: PushTotals })
  totals!: PushTotals;

  @ApiProperty({
    description: 'Outcome of every selected change, in the order applied',
    type: [PushedChange],
  })
  changes!: PushedChange[];
}
