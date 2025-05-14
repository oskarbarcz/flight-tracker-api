import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRotationDto {
  @ApiProperty({
    description: 'Rotation name',
    example: 'Morning Shift',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}