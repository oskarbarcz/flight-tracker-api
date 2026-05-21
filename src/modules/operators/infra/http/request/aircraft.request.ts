import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Aircraft } from '../../../model/aircraft.model';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { LegacyOperatorResponse } from './operator.request';

export class CreateAircraftRequest {
  @ApiProperty({
    description:
      'ICAO aircraft type designator (4-letter code). Must match an airframe defined in the curated airframes list.',
    example: 'B77W',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  type!: string;

  @ApiProperty({
    description: 'Aircraft registration matching act of registration',
    example: 'D-AIMC',
  })
  @IsString()
  @IsNotEmpty()
  registration!: string;

  @ApiProperty({
    description: 'Aircraft SELCAL code',
    example: 'KR-QL',
  })
  @IsString()
  @IsNotEmpty()
  selcal!: string;

  @ApiProperty({
    description: 'Aircraft livery description and age',
    example: 'Boeing House (2024)',
  })
  @IsString()
  @IsNotEmpty()
  livery!: string;
}

export class UpdateAircraftRequest extends PartialType(CreateAircraftRequest) {}

export class GetAircraftResponse extends Aircraft {}

export class LegacyCreateAircraftResponse extends Aircraft {
  @ApiProperty({
    description: 'Aircraft operator',
    type: LegacyOperatorResponse,
    deprecated: true,
  })
  operator!: LegacyOperatorResponse | null;
}
