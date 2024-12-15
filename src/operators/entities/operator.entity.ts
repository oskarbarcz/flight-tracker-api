import { ApiProperty } from '@nestjs/swagger';

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
  icaoCode: string;

  @ApiProperty({
    description: 'Operator name',
    example: 'Condor',
  })
  shortName: string;

  @ApiProperty({
    description: 'Full operator company name',
    example: 'Condor Flugdienst GmbH',
  })
  companyRegistryName: string;
}
