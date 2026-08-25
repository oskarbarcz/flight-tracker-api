import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { HOLD_VARIANT_IDS } from '../../../../manifest/data/hold-identifiers';

export class AssignHoldVariantRequest {
  @ApiProperty({
    description:
      'Hold variant identifier, as the hold catalogue reports it for this airframe type',
    enum: HOLD_VARIANT_IDS,
    example: 'a320-cls',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  holdVariant!: string;
}
