import { ApiProperty } from '@nestjs/swagger';

type OperatorIcaoCode = string;

export type TerminalId = string & {};

export class TerminalBriefing {
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
    description: 'Short terminals identifier',
    example: 'T5a',
  })
  shortName!: string;

  @ApiProperty({
    description: 'Terminal name',
    example: 'Terminal 5A',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Average taxi time from stand to runway threshold in minutes',
    example: 15,
  })
  averageTaxiTime!: number;

  @ApiProperty({
    description: 'ICAO codes of operators using terminals',
    example: ['BAW', 'LOT'],
  })
  operatorCodes!: OperatorIcaoCode[];
}
