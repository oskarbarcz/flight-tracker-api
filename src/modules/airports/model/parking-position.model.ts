import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { YesOrNoString } from 'src/core/types/monada';
import { TerminalId } from './terminal.model';
import { Coordinates } from './airport.model';

export type ParkingPositionId = string & {};

export type BridgeOption = YesOrNoString;

export enum StairOption {
  No = 'no',
  WithBus = 'with-bus-transport',
  WithPassengerWalking = 'with-passenger-walking',
  WithBusOrPassengerWalking = 'with-bus-or-passenger-walking',
}

export enum DeicingOption {
  No = 'no',
  Possible = 'possible',
  Recommended = 'recommended',
  Mandatory = 'mandatory',
}

export enum GpuAvailability {
  No = 'no',
  Bridge = 'bridge',
  Standalone = 'standalone',
  Both = 'both',
}

export enum PcaAvailability {
  No = 'no',
  Bridge = 'bridge',
  Standalone = 'standalone',
  Both = 'both',
}

export enum ParkingPositionType {
  Angled = 'angled',
  StraightIn = 'straight-in',
  AngledTaxiThrough = 'angled-taxi-through',
  StraightInTaxiThrough = 'straight-in-taxi-through',
}

export enum ParkingLocation {
  Remote = 'remote',
  Gate = 'gate',
}

export enum ParkingSpotType {
  Passenger = 'passenger',
  Cargo = 'cargo',
  Other = 'other',
}

export enum ParkingAssistanceType {
  None = 'none',
  Vdgs = 'vdgs',
  Marshaller = 'marshaller',
  VdgsOrMarshaller = 'vdgs-or-marshaller',
}

export enum FuelingOptions {
  None = 'none',
  Truck = 'truck',
  Hydrant = 'hydrant',
}

export type NoiseSensitivityOption = YesOrNoString;

export class ParkingPosition {
  @ApiProperty({
    description: 'Parking position unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    format: 'uuid',
  })
  id!: ParkingPositionId;

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
    description: 'Parking position name, as used by ATC and ground ops',
    example: '445',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  name!: string;

  @ApiProperty({
    description: 'Whether parking position has jet bridge',
    enum: YesOrNoString,
    example: YesOrNoString.Yes,
  })
  @IsEnum(YesOrNoString)
  bridge!: BridgeOption;

  @ApiProperty({
    description: 'Stairs boarding option at the parking position',
    enum: StairOption,
    example: StairOption.No,
  })
  @IsEnum(StairOption)
  stairs!: StairOption;

  @ApiProperty({
    description: 'Deicing capability at the parking position',
    enum: DeicingOption,
    example: DeicingOption.Possible,
  })
  @IsEnum(DeicingOption)
  deicing!: DeicingOption;

  @ApiProperty({
    description: 'Free-text notes about deicing at the parking position',
    example: 'Deicing pad shared with stand B6. Coordinate with ground ops.',
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  deicingDescription?: string | null;

  @ApiProperty({
    description: 'Ground Power Unit availability at the parking position',
    enum: GpuAvailability,
    example: GpuAvailability.Bridge,
  })
  @IsEnum(GpuAvailability)
  gpu!: GpuAvailability;

  @ApiProperty({
    description: 'Pre-Conditioned Air availability at the parking position',
    enum: PcaAvailability,
    example: PcaAvailability.Bridge,
  })
  @IsEnum(PcaAvailability)
  pca!: PcaAvailability;

  @ApiProperty({
    description: 'Parking position type',
    enum: ParkingPositionType,
    example: ParkingPositionType.StraightIn,
  })
  @IsEnum(ParkingPositionType)
  type!: ParkingPositionType;

  @ApiProperty({
    description: 'Parking spot type',
    enum: ParkingSpotType,
    example: ParkingSpotType.Passenger,
  })
  @IsEnum(ParkingSpotType)
  spotType!: ParkingSpotType;

  @ApiProperty({
    description: 'Parking assistance type',
    enum: ParkingAssistanceType,
    example: ParkingAssistanceType.Vdgs,
  })
  @IsEnum(ParkingAssistanceType)
  assistance!: ParkingAssistanceType;

  @ApiProperty({
    description: 'Parking location category',
    enum: ParkingLocation,
    example: ParkingLocation.Gate,
  })
  @IsEnum(ParkingLocation)
  location!: ParkingLocation;

  @ApiProperty({
    description: 'Whether parking position is located at noise-sensitive area',
    enum: YesOrNoString,
    example: YesOrNoString.No,
  })
  @IsEnum(YesOrNoString)
  noiseSensitivity!: NoiseSensitivityOption;

  @ApiProperty({
    description:
      'Free-text notes about noise restrictions at the parking position',
    example: 'Night curfew: no engine runs or pushbacks permitted.',
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  noiseSensitivityText?: string | null;

  @ApiProperty({
    description: 'Start of the noise-sensitive window in 24h HH:mm UTC',
    example: '21:00',
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsMilitaryTime()
  noiseSensitivityStartTime?: string | null;

  @ApiProperty({
    description: 'End of the noise-sensitive window in 24h HH:mm UTC',
    example: '05:00',
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsMilitaryTime()
  noiseSensitivityEndTime?: string | null;

  @ApiProperty({
    description: 'Fueling options at the parking position',
    enum: FuelingOptions,
    example: FuelingOptions.Hydrant,
  })
  @IsEnum(FuelingOptions)
  fuelingOptions!: FuelingOptions;

  @ApiProperty({
    description: 'Parking position coordinates',
    type: Coordinates,
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Coordinates)
  coordinates?: Coordinates | null;
}
