import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Aircraft } from '../../model/aircraft.model';
import { Operator } from '../../model/operator.model';
import { IsNotEmpty, IsString } from 'class-validator';

export class LegacyCreateAircraftRequest extends OmitType(Aircraft, [
  'id',
] as const) {
  @ApiProperty({
    description: 'Aircraft operator',
  })
  @IsString()
  @IsNotEmpty()
  operatorId!: string;
}

export class LegacyCreateAircraftResponse extends Aircraft {
  @ApiProperty({
    description: 'Aircraft operator',
    type: Operator,
  })
  operator!: Operator | null;
}

export class LegacyUpdateAircraftRequest extends PartialType(
  LegacyCreateAircraftRequest,
) {}

export class LegacyUpdateAircraftResponse extends PartialType(
  LegacyCreateAircraftResponse,
) {}
