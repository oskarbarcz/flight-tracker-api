import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateTravelDto {
  @ApiProperty({
    description: 'Airport the user wants to travel to',
    example: 'f35c094a-bec5-4803-be32-bd80a14b441a',
  })
  @IsUUID()
  destinationAirportId!: string;
}
