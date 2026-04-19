import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

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
}
