import { ApiProperty } from '@nestjs/swagger';
import { Airframe } from '../../airframes/model/airframe.model';
import { ShortOperatorResponse } from '../../flights/infra/http/request/operator.request';

export class UserAircraftEntry {
  @ApiProperty({
    description: 'Aircraft unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
  })
  id!: string;

  @ApiProperty({
    description: 'Aircraft registration matching act of registration',
    example: 'D-AIMC',
  })
  registration!: string;

  @ApiProperty({
    description: 'Airframe that describes this aircraft type',
    type: Airframe,
  })
  airframe!: Airframe;

  @ApiProperty({
    description: 'Aircraft livery description and age',
    example: 'Fanhansa (2024)',
  })
  livery!: string;

  @ApiProperty({
    description: 'Operator of the flight the aircraft was flown on',
    type: ShortOperatorResponse,
  })
  operator!: ShortOperatorResponse;

  @ApiProperty({
    description: 'Flight the aircraft was flown on',
    example: '23da8bc9-a21b-4678-b2e9-1151d3bd15ab',
  })
  flightId!: string;
}
