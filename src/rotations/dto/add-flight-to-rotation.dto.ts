import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddFlightToRotationDto {
  @ApiProperty({
    description: 'Flight ID to add to the rotation',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  @IsUUID('4')
  @IsNotEmpty()
  flightId: string;
}