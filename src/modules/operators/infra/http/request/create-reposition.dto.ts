import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRepositionDto {
  @ApiProperty({
    description: 'Airport the aircraft should be repositioned to',
    example: 'f35c094a-bec5-4803-be32-bd80a14b441a',
  })
  @IsUUID()
  destinationAirportId!: string;
}
