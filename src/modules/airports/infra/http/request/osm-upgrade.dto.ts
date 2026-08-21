import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  AirportOsmProposal,
  AirportOsmPushResult,
} from '../../../model/osm-upgrade.model';

export class PullAirportOsmDataFilters {
  @ApiPropertyOptional({
    description:
      'Query OpenStreetMap again instead of reusing the pull already held for this airport. Overpass is a free public service, so reach for this only when the data is known to have moved on.',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  refresh?: boolean;
}

export class PushAirportOsmDataRequest {
  @ApiProperty({
    description:
      'Keys of the proposed changes to apply, exactly as the proposal reported them. Anything not named here is left alone.',
    type: [String],
    example: ['airport:shape', 'runway:09', 'terminal:HT'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  items!: string[];
}

export class GetAirportOsmProposalResponse extends AirportOsmProposal {}

export class PushAirportOsmDataResponse extends AirportOsmPushResult {}
