import { ApiProperty } from '@nestjs/swagger';
import { IsIn, ValidateIf } from 'class-validator';
import { GroundServiceSource } from '../../../model/ground-service-source';

export class StartGroundServiceDto {
  @ApiProperty({
    description:
      'Sent by the Transponder when the pilot requested this through GSX. Leave it out otherwise: the API then records the event as `manual`, or as `override` if the GSX settings had this step set to start automatically',
    enum: [GroundServiceSource.Gsx],
    example: GroundServiceSource.Gsx,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn([GroundServiceSource.Gsx])
  source?: GroundServiceSource.Gsx;
}
