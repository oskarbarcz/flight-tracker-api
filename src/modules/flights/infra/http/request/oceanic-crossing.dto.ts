import { ApiProperty } from '@nestjs/swagger';
import { OceanicRouting, TrackDirection } from '../../../model/oceanic.model';

export class OceanicTrackFixResponse {
  @ApiProperty({ description: 'Identifier of the track fix', example: 'MALOT' })
  ident!: string;

  @ApiProperty({ description: 'Latitude of the track fix', example: 54 })
  latitude!: number;

  @ApiProperty({ description: 'Longitude of the track fix', example: -15 })
  longitude!: number;
}

export class OceanicTrackResponse {
  @ApiProperty({ description: 'Identifier of the track', example: 'A' })
  identifier!: string;

  @ApiProperty({
    description: 'Direction the track is published for',
    enum: TrackDirection,
    example: TrackDirection.West,
  })
  direction!: TrackDirection;

  @ApiProperty({
    description: 'Track message identifier the track was published under',
    example: '241',
  })
  tmi!: string;

  @ApiProperty({
    description: 'Oceanic control area that issued the track',
    example: 'EGGX',
    nullable: true,
    type: String,
  })
  issuingOca!: string | null;

  @ApiProperty({
    description: 'Route string of the track',
    example: 'MALOT 5620N 5730N JANJO',
    nullable: true,
    type: String,
  })
  route!: string | null;

  @ApiProperty({
    description: 'Flight levels available on the track',
    example: [340, 350, 360, 370, 380, 390, 400],
    type: [Number],
  })
  levels!: number[];

  @ApiProperty({
    description: 'Start of the period the track is valid for',
    example: '2025-01-05T11:00:00.000Z',
    nullable: true,
    type: String,
  })
  validFrom!: Date | null;

  @ApiProperty({
    description: 'End of the period the track is valid for',
    example: '2025-01-05T18:30:00.000Z',
    nullable: true,
    type: String,
  })
  validTo!: Date | null;

  @ApiProperty({
    description: 'Fixes the track runs through, in order',
    type: [OceanicTrackFixResponse],
  })
  fixes!: OceanicTrackFixResponse[];
}

export class FlightOceanicCrossingResponse {
  @ApiProperty({
    description:
      'How the flight relates to the track structure <br />' +
      '**track**: the plan routes along the track and files it as a track.<br />' +
      '**track_geometry**: the plan follows the track waypoints but files them individually, so the flight is not cleared on the track.<br />' +
      '**random**: no track is involved.',
    enum: OceanicRouting,
    example: OceanicRouting.Track,
  })
  routing!: OceanicRouting;

  @ApiProperty({
    description:
      'Track the flight relates to, or null where it is randomly routed',
    example: 'A',
    nullable: true,
    type: String,
  })
  trackId!: string | null;

  @ApiProperty({
    description:
      'Track direction that applies to the flight, as the plan companion file states it',
    enum: TrackDirection,
    nullable: true,
    example: TrackDirection.East,
  })
  direction!: TrackDirection | null;

  @ApiProperty({
    description:
      'Every track the plan published, both directions, as published. Empty where the plan published none.',
    type: [OceanicTrackResponse],
  })
  tracks!: OceanicTrackResponse[];
}
