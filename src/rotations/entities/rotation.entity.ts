import { ApiProperty } from '@nestjs/swagger';
import { Flight } from '../../flights/entities/flight.entity';
import { User } from '@prisma/client';

export class Rotation {
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
    description: 'User who owns this rotation',
  })
  user?: User;

  @ApiProperty({
    description: 'Flights in this rotation',
    type: [Flight],
  })
  flights: Flight[];

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