import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignFlightCrewRequest {
  @ApiProperty({
    description: 'Crew member unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  @IsUUID(4)
  @IsNotEmpty()
  crewId!: string;
}
