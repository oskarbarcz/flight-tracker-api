import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AssignCabinLayoutRequest {
  @ApiProperty({
    description: 'Cabin layout identifier, as the catalogue reports it',
    example: 'aa-77w',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  cabinLayout!: string;
}
