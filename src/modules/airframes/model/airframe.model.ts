import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SpeedUnit {
  Mach = 'mach',
  Knots = 'knots',
}

export enum PerformanceCode {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

export enum WeightCategory {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Super = 'super',
}

export enum AirframeServiceType {
  Passenger = 'passenger',
  Cargo = 'cargo',
  Both = 'both',
}

export class CruiseSpeed {
  @ApiProperty({
    description:
      'Cruise speed numeric value. Either a Mach number (e.g. 0.84) or knots (e.g. 240).',
    example: 0.84,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  value!: number;

  @ApiProperty({
    description: 'Unit of the cruise speed value',
    enum: SpeedUnit,
    example: SpeedUnit.Mach,
  })
  @IsEnum(SpeedUnit)
  unit!: SpeedUnit;
}

export class Airframe {
  @ApiProperty({
    description: 'ICAO aircraft type designator (4-letter code)',
    example: 'B77W',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  type!: string;

  @ApiProperty({
    description:
      'IATA aircraft type code; null for airframes IATA publishes no code for. Cabin layouts are keyed by this code, aircraft by the ICAO designator.',
    example: '77W',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  iataType!: string | null;

  @ApiProperty({
    description: 'Airframe model name',
    example: 'B777-300ER',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Typical cruise speed',
    type: CruiseSpeed,
  })
  @ValidateNested()
  @Type(() => CruiseSpeed)
  cruiseSpeed!: CruiseSpeed;

  @ApiProperty({
    description: 'Service ceiling in feet',
    example: 43000,
  })
  @IsInt()
  serviceCeiling!: number;

  @ApiProperty({
    description:
      'ICAO approach-speed performance category (A–E). Higher letters indicate higher approach speeds.',
    enum: PerformanceCode,
    example: PerformanceCode.D,
  })
  @IsIn(Object.values(PerformanceCode))
  performanceCode!: PerformanceCode;

  @ApiProperty({
    description: 'ICAO wake turbulence category',
    enum: WeightCategory,
    example: WeightCategory.Heavy,
  })
  @IsIn(Object.values(WeightCategory))
  weightCategory!: WeightCategory;

  @ApiProperty({
    description:
      'Service the airframe is built for. Freighter-only airframes are cargo, airframes with a factory cargo or combi role next to a passenger one are both, everything else is passenger.',
    enum: AirframeServiceType,
    example: AirframeServiceType.Passenger,
  })
  @IsEnum(AirframeServiceType)
  serviceType!: AirframeServiceType;
}
