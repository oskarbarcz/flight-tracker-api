import { ApiProperty } from '@nestjs/swagger';
import { TrackDirection } from '../../flights/model/oceanic.model';

export enum OceanicTrackSystem {
  Pacots = 'pacots',
}

export type CurrentOceanicTrackFix = {
  ident: string;
  latitude: number;
  longitude: number;
};

export type CurrentOceanicTrack = {
  system: OceanicTrackSystem;
  identifier: string;
  direction: TrackDirection;
  issuingAuthority: string;
  notamNumber: string;
  validFrom: Date;
  validTo: Date;
  route: string;
  levels: number[];
  fixes: CurrentOceanicTrackFix[];
  unresolvedFixes: string[];
  remarks: string | null;
  message: string;
};

export type CurrentOceanicTracks = {
  fetchedAt: Date;
  tracks: CurrentOceanicTrack[];
};

export class CurrentOceanicTrackFixResponse {
  @ApiProperty({
    description:
      'The fix as written in the route: a name, or a point such as 52N140W',
    example: 'PUPPI',
  })
  ident!: string;

  @ApiProperty({ description: 'Latitude of the fix', example: 21.921383 })
  latitude!: number;

  @ApiProperty({ description: 'Longitude of the fix', example: -161.679633 })
  longitude!: number;
}

export class CurrentOceanicTrackResponse {
  @ApiProperty({
    description: 'Organised track system the track belongs to',
    enum: OceanicTrackSystem,
    example: OceanicTrackSystem.Pacots,
  })
  system!: OceanicTrackSystem;

  @ApiProperty({
    description:
      "The track's published name: a letter for Oakland's westbound tracks, a number for Fukuoka's eastbound ones",
    example: 'A',
  })
  identifier!: string;

  @ApiProperty({
    description: 'Direction the track is published for',
    enum: TrackDirection,
    example: TrackDirection.West,
  })
  direction!: TrackDirection;

  @ApiProperty({
    description: 'ICAO location of the unit that published the track',
    example: 'KZAK',
  })
  issuingAuthority!: string;

  @ApiProperty({
    description:
      'NOTAM carrying the track. A Fukuoka message carries several tracks, so they share it.',
    example: 'A5313/26',
  })
  notamNumber!: string;

  @ApiProperty({
    description: 'Start of the period the track is valid for',
    example: '2026-11-03T19:00:00.000Z',
    type: String,
  })
  validFrom!: Date;

  @ApiProperty({
    description: 'End of the period the track is valid for',
    example: '2026-11-04T08:00:00.000Z',
    type: String,
  })
  validTo!: Date;

  @ApiProperty({
    description:
      'Oceanic part of the track as published, without the connecting routes',
    example: 'PUPPI CRESP 23N170W 25N180E 27N170E 28N160E 31N150E TONIK',
  })
  route!: string;

  @ApiProperty({
    description:
      'Flight levels the track is published for. Pacific tracks publish none, so the list is empty.',
    example: [],
    type: [Number],
  })
  levels!: number[];

  @ApiProperty({
    description: 'Every fix on the route that could be placed, in order',
    type: [CurrentOceanicTrackFixResponse],
  })
  fixes!: CurrentOceanicTrackFixResponse[];

  @ApiProperty({
    description:
      'Fixes on the route that could not be placed, in order. They are left out of the fixes rather than guessed.',
    example: [],
    type: [String],
  })
  unresolvedFixes!: string[];

  @ApiProperty({
    description: "The track's remarks, one per line",
    example: 'TRK B NOT AVAILABLE',
    nullable: true,
    type: String,
  })
  remarks!: string | null;

  @ApiProperty({
    description:
      'The track message exactly as published, connecting routes included',
    example:
      '(TDM TRK A 261103190001 2611031900 2611040800 PUPPI CRESP 23N170W 25N180E 27N170E 28N160E 31N150E TONIK RTS/PHNL KEOLA PUPPI TONIK G223 BEGAD RMK/TRK B NOT AVAILABLE )',
  })
  message!: string;
}

export class CurrentOceanicTracksResponse {
  @ApiProperty({
    description: 'When the tracks were read from the FAA',
    example: '2026-11-03T22:02:47.722Z',
    type: String,
  })
  fetchedAt!: Date;

  @ApiProperty({
    description:
      'Every track published now, ordered by issuing unit and then by track',
    type: [CurrentOceanicTrackResponse],
  })
  tracks!: CurrentOceanicTrackResponse[];
}
