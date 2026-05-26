import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Coordinates } from './airport.model';

type OperatorIcaoCode = string;

export type TerminalId = string & {};

export class Terminal {
  @ApiProperty({
    description: 'Terminal unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  id!: TerminalId;

  @ApiProperty({
    description: 'Airport unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  airportId!: string;

  @ApiProperty({
    description: 'Short terminal identifier',
    example: 'T5a',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 8)
  shortName!: string;

  @ApiProperty({
    description: 'Terminal name',
    example: 'Terminal 5A',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  fullName!: string;

  @ApiProperty({
    description: 'Average taxi time from stand to runway threshold in minutes',
    example: 15,
  })
  @IsInt()
  @Min(0)
  averageTaxiTime!: number;

  @ApiProperty({
    description: 'ICAO codes of operators using terminal',
    example: ['BAW', 'LOT'],
    type: [String],
  })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  operatorCodes!: OperatorIcaoCode[];

  @ApiProperty({
    description: 'Free-text briefing notes about the terminal',
    example: 'Gates 1–20. Remote stands accessed via bus.',
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  text?: string | null;

  @ApiProperty({
    description: 'Terminal footprint polygon as a list of coordinates',
    type: [Coordinates],
    minItems: 3,
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => Coordinates)
  shape?: Coordinates[] | null;
}
