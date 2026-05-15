import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Coordinates } from './airport.model';

export type RunwayId = string & {};

export enum SurfaceType {
  Asphalt = 'asphalt',
  Concrete = 'concrete',
  Grass = 'grass',
  Gravel = 'gravel',
  Unknown = 'unknown',
}

export enum LightingType {
  HIRL = 'HIRL',
  MIRL = 'MIRL',
  LIRL = 'LIRL',
  ALS = 'ALS',
  Unknown = 'unknown',
}

export class Runway {
  @ApiProperty({
    description: 'Runway unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  id!: RunwayId;

  @ApiProperty({
    description: 'Airport unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  airportId!: string;

  @ApiProperty({
    description: 'Runway end designator (01-36 with optional L/C/R suffix)',
    example: '07L',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4)
  @Matches(/^(0[1-9]|[12]\d|3[0-6])[LCR]?$/, {
    message:
      'designator must be a runway end designator (01-36 with optional L/C/R suffix)',
  })
  designator!: string;

  @ApiProperty({
    description: 'Runway length in meters',
    example: 4000,
  })
  @IsInt()
  @Min(1)
  length!: number;

  @ApiProperty({
    description: 'Runway width in meters',
    example: 60,
  })
  @IsInt()
  @Min(1)
  width!: number;

  @ApiProperty({
    description: 'Displaced threshold in meters',
    example: 306,
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displace?: number | null;

  @ApiProperty({
    description: 'True heading in integer degrees (0-359)',
    example: 69,
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(359)
  trueHeading?: number | null;

  @ApiProperty({
    description: 'Magnetic heading in integer degrees (0-359)',
    example: 72,
  })
  @IsInt()
  @Min(0)
  @Max(359)
  magneticHeading!: number;

  @ApiProperty({
    description: 'Threshold elevation in meters',
    example: 111,
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsInt()
  elevation?: number | null;

  @ApiProperty({
    description: 'Runway surface type',
    enum: SurfaceType,
    example: SurfaceType.Asphalt,
  })
  @IsEnum(SurfaceType)
  surfaceType!: SurfaceType;

  @ApiProperty({
    description: 'Runway lighting type',
    enum: LightingType,
    example: LightingType.HIRL,
  })
  @IsEnum(LightingType)
  lightingType!: LightingType;

  @ApiProperty({
    description: 'Coordinates of the runway end opposite the threshold',
    type: Coordinates,
  })
  @Type(() => Coordinates)
  @IsNotEmpty()
  coordinates!: Coordinates;
}
