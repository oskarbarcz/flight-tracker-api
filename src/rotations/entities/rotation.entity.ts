import { ApiProperty } from '@nestjs/swagger';
import { Flight } from '../../flights/entities/flight.entity';
import { Uuid } from '../../common/types/id';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export type RotationId = Uuid & { _entity: 'Rotation' };

export class Rotation {
  @ApiProperty({
    description: 'Rotation unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  id: RotationId;

  @ApiProperty({
    description: 'Rotation name',
    example: 'Morning Shift',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Pilot unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  @IsUUID(4)
  @IsNotEmpty()
  pilotId: string;

  @ApiProperty({
    description: 'Flights in this rotation',
    type: Flight,
    isArray: true,
  })
  flights: Flight[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-01T00:00:00.000Z',
    nullable: true,
    type: Date,
  })
  updatedAt: Date | null;
}
