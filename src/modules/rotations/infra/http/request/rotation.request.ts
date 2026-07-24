import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RotationStatus } from '../../../model/rotation.model';

export class ListRotationsFilters {
  @ApiProperty({
    enum: RotationStatus,
    required: false,
    example: RotationStatus.Ready,
  })
  @IsOptional()
  @IsEnum(RotationStatus)
  status?: RotationStatus;
}

export class CreateRotationRequest {
  @ApiProperty({ example: 'FRA-JFK-FRA 2025-01-01' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  @IsUUID(4)
  pilotId!: string;
}

export class EditRotationRequest {
  @ApiProperty({ example: 'FRA-JFK-FRA 2025-01-01' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  @IsUUID(4)
  pilotId!: string;
}

export class AddLegRequest {
  @ApiProperty({ example: 'LH450' })
  @IsString()
  @IsNotEmpty()
  flightNumber!: string;

  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  @IsUUID(4)
  departureId!: string;

  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  @IsUUID(4)
  arrivalId!: string;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  offBlockTime!: Date;

  @ApiProperty({ example: '2025-01-01T11:35:00.000Z' })
  @Type(() => Date)
  @IsDate()
  onBlockTime!: Date;
}

export class UpdateLegRequest extends PartialType(AddLegRequest) {}
