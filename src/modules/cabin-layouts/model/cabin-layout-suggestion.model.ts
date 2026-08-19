import { ApiProperty } from '@nestjs/swagger';
import { CabinLayout } from './cabin-layout.model';

export enum CabinLayoutMatch {
  Exact = 'exact',
  Airline = 'airline',
  AircraftType = 'aircraft_type',
}

export class CabinLayoutSuggestion extends CabinLayout {
  @ApiProperty({
    description:
      'How the layout was matched: on both the airline and the aircraft type, on the airline alone, or on the aircraft type alone',
    enum: CabinLayoutMatch,
    example: CabinLayoutMatch.Exact,
  })
  match!: CabinLayoutMatch;
}

export class CabinLayoutSuggestionList {
  @ApiProperty({ type: CabinLayoutSuggestion, isArray: true })
  items!: CabinLayoutSuggestion[];

  @ApiProperty({ example: 3 })
  total!: number;
}
