import { ApiProperty } from '@nestjs/swagger';
import { RotationLeg } from './rotation-leg.model';

export enum RotationStatus {
  Draft = 'draft',
  Ready = 'ready',
  InProgress = 'in_progress',
  Finished = 'finished',
}

export class RotationUser {
  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  id!: string;

  @ApiProperty({ example: 'Alice Doe' })
  name!: string;
}

export class Rotation {
  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  id!: string;

  @ApiProperty({ example: 'FRA-JFK-FRA 2025-01-01' })
  name!: string;

  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  operatorId!: string;

  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  pilotId!: string;

  @ApiProperty({ enum: RotationStatus, example: RotationStatus.Draft })
  status!: RotationStatus;

  @ApiProperty({ type: RotationUser })
  createdBy!: RotationUser;

  @ApiProperty({ type: RotationUser, nullable: true })
  updatedBy!: RotationUser | null;

  @ApiProperty({ type: RotationLeg, isArray: true })
  legs!: RotationLeg[];

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    nullable: true,
    type: Date,
  })
  updatedAt!: Date | null;
}
