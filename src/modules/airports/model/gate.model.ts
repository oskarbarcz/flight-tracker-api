import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TerminalId } from './terminal.model';
import { ParkingPositionId } from './parking-position.model';

export type GateId = string & {};

export enum GateCategory {
  Schengen = 'schengen',
  NonSchengen = 'non-schengen',
  Domestic = 'domestic',
  International = 'international',
}

export class Gate {
  @ApiProperty({
    description: 'Gate unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  id!: GateId;

  @ApiProperty({
    description: 'Airport unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  airportId!: string;

  @ApiProperty({
    description: 'Terminal unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  @IsUUID()
  terminalId!: TerminalId;

  @ApiProperty({
    description: 'Gate name, as displayed to passengers',
    example: 'C30',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  name!: string;

  @ApiProperty({
    description: 'Border control category of passengers the gate serves',
    enum: GateCategory,
    example: GateCategory.Schengen,
  })
  @IsEnum(GateCategory)
  category!: GateCategory;

  @ApiProperty({
    description: 'Parking position unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsUUID()
  parkingPositionId?: ParkingPositionId | null;
}
