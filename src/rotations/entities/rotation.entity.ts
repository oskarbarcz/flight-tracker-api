import { ApiProperty } from '@nestjs/swagger';
import { Uuid } from '../../common/types/id';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PilotDto } from '../../users/dto/get-user.dto';

export type RotationId = Uuid & { _entity: 'Rotation' };

export class RotationFlight {
  @ApiProperty({
    description: 'Flight unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  id: string;

  @ApiProperty({
    description: 'Flight number',
    example: 'DAL 1234',
  })
  flightNumber: string;
}

export class Rotation {
  @ApiProperty({
    description: 'Rotation unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  id: RotationId;

  @ApiProperty({
    description: 'Rotation name',
    example: '2025-01',
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
    description: 'Pilot',
    type: PilotDto,
  })
  pilot: PilotDto;

  @ApiProperty({
    description: 'Flights in this rotation',
    type: RotationFlight,
    isArray: true,
  })
  flights: RotationFlight[];

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
