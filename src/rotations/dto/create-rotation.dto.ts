import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateRotationDto {
  @ApiProperty({
    description: 'Rotation name',
    example: 'Morning Shift',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateRotationResponse {
  @ApiProperty({
    description: 'Rotation unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  id: string;

  @ApiProperty({
    description: 'Rotation name',
    example: 'Morning Shift',
  })
  name: string;

  @ApiProperty({
    description: 'User ID who owns this rotation',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  userId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-04-28T18:21:04.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-04-28T18:21:04.000Z',
  })
  updatedAt: Date;
}