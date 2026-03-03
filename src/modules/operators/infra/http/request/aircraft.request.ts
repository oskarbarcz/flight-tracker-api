import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Aircraft } from '../../../model/aircraft.model';
import { IsNotEmpty, IsString } from 'class-validator';
import { LegacyOperatorResponse } from './operator.request';

export class LegacyCreateAircraftRequest extends OmitType(Aircraft, [
  'id',
] as const) {
  @ApiProperty({
    description: 'Aircraft operator',
    deprecated: true,
  })
  @IsString()
  @IsNotEmpty()
  operatorId!: string;
}

export class LegacyCreateAircraftResponse extends Aircraft {
  @ApiProperty({
    description: 'Aircraft operator',
    type: LegacyOperatorResponse,
    deprecated: true,
  })
  operator!: LegacyOperatorResponse | null;
}

export class LegacyUpdateAircraftRequest extends PartialType(
  LegacyCreateAircraftRequest,
) {}

export class LegacyUpdateAircraftResponse extends PartialType(
  LegacyCreateAircraftResponse,
) {}

export class CreateAircraftRequest extends OmitType(Aircraft, [
  'id',
] as const) {}

export class UpdateAircraftRequest extends PartialType(CreateAircraftRequest) {}

export class GetAircraftResponse extends Aircraft {}
