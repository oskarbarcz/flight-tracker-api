import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Operator {
  @ApiProperty({
    description: 'Operator unique system identifier',
    example: 'eab840d0-901b-4ad5-90e3-7f2b0b13ed2d',
  })
  id: string;

  @ApiProperty({
    description: 'Operator ICAO code',
    example: 'CDG',
  })
  @IsString()
  @IsNotEmpty()
  icaoCode: string;

  @ApiProperty({
    description: 'Operator name',
    example: 'Condor',
  })
  @IsString()
  @IsNotEmpty()
  shortName: string;

  @ApiProperty({
    description: 'Full operator company name',
    example: 'Condor Flugdienst GmbH',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Callsign used by air traffic control services',
    example: 'Condor',
  })
  @IsString()
  @IsNotEmpty()
  callsign: string;
}
