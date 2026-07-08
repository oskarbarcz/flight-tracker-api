import { ApiProperty } from '@nestjs/swagger';

export class GetAirportWeatherResponse {
  @ApiProperty({
    description: 'Raw METAR report as provided by the weather source',
    example: 'EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG',
    nullable: true,
  })
  metar!: string | null;

  @ApiProperty({
    description: 'When the METAR was last fetched',
    example: '2026-07-08T12:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  metarLastUpdate!: Date | null;

  @ApiProperty({
    description: 'Raw TAF report as provided by the weather source',
    example: 'TAF EPWA 081100Z 0812/0918 20008KT 9999 SCT040',
    nullable: true,
  })
  taf!: string | null;

  @ApiProperty({
    description: 'When the TAF was last fetched',
    example: '2026-07-08T11:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  tafLastUpdate!: Date | null;

  @ApiProperty({
    description:
      'Whether the airport is currently watched for scheduled updates',
    example: true,
  })
  watch!: boolean;
}
