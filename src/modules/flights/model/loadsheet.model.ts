import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const tons = { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 3 };

export class FuelBreakdown {
  @ApiProperty({ description: 'Block (ramp) fuel in tons', example: 71.6 })
  @IsNotEmpty()
  @IsNumber(tons)
  block!: number;

  @ApiProperty({ description: 'Taxi fuel in tons', example: 0.8 })
  @IsNotEmpty()
  @IsNumber(tons)
  taxi!: number;

  @ApiProperty({ description: 'Trip (enroute burn) fuel in tons', example: 58 })
  @IsNotEmpty()
  @IsNumber(tons)
  trip!: number;

  @ApiProperty({ description: 'Alternate fuel in tons', example: 4.2 })
  @IsNotEmpty()
  @IsNumber(tons)
  alternate!: number;

  @ApiProperty({ description: 'Final reserve fuel in tons', example: 2.9 })
  @IsNotEmpty()
  @IsNumber(tons)
  reserve!: number;

  @ApiProperty({
    description:
      'Rule used to compute contingency fuel, or null when unspecified',
    example: '5% of trip',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  contingencyType!: string | null;

  @ApiProperty({ description: 'Contingency fuel in tons', example: 1.5 })
  @IsNotEmpty()
  @IsNumber(tons)
  contingencyAmount!: number;

  @ApiProperty({
    description: 'Additional fuel for MEL items in tons',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber(tons)
  mel!: number;

  @ApiProperty({
    description: 'Additional fuel for ATC constraints in tons',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber(tons)
  atc!: number;

  @ApiProperty({
    description: 'Additional fuel for weather in tons',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber(tons)
  wxx!: number;

  @ApiProperty({
    description: 'Discretionary extra fuel in tons',
    example: 0.6,
  })
  @IsNotEmpty()
  @IsNumber(tons)
  extra!: number;

  @ApiProperty({ description: 'Tankering fuel in tons', example: 0 })
  @IsNotEmpty()
  @IsNumber(tons)
  tankering!: number;

  @ApiProperty({
    description: 'ETOPS critical-fuel scenario reserve in tons',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber(tons)
  etops?: number;

  @ApiProperty({
    description: 'Minimum required takeoff fuel in tons',
    example: 70.8,
    required: false,
  })
  @IsOptional()
  @IsNumber(tons)
  minTakeoff?: number;

  @ApiProperty({
    description: 'Planned takeoff fuel in tons',
    example: 70.8,
    required: false,
  })
  @IsOptional()
  @IsNumber(tons)
  planTakeoff?: number;

  @ApiProperty({
    description: 'Planned landing fuel in tons',
    example: 12.8,
    required: false,
  })
  @IsOptional()
  @IsNumber(tons)
  planLanding?: number;

  @ApiProperty({
    description: 'Average fuel flow in tons per hour',
    example: 5.8,
    required: false,
  })
  @IsOptional()
  @IsNumber(tons)
  averageFuelFlow?: number;

  @ApiProperty({
    description: 'Usable fuel tank capacity in tons',
    example: 111,
    required: false,
  })
  @IsOptional()
  @IsNumber(tons)
  maxTanks?: number;
}

export class FlightCrew {
  @ApiProperty({
    description: 'Pilots in command of a flight during takeoff and landing',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  pilots!: number;

  @ApiProperty({
    description: 'Relief pilots taking care of the aircraft in cruise',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  reliefPilots!: number;

  @ApiProperty({
    description: 'Cabin crew members serving passengers during the flight',
    example: 4,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  cabinCrew!: number;
}

export class Loadsheet {
  @ApiProperty({
    description: 'Time when the aircraft lands',
    type: () => FlightCrew,
  })
  @IsNotEmpty()
  @Type(() => FlightCrew)
  flightCrew!: FlightCrew;

  @ApiProperty({
    description: 'Number of passengers on board excluding flight crew',
    example: 200,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  passengers!: number;

  @ApiProperty({
    description: 'Cargo in tons',
    example: 3.5,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  cargo!: number;

  @ApiProperty({
    description: 'Aircraft payload in tons',
    example: 22.507,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 3 })
  payload!: number;

  @ApiProperty({
    description: 'Zero fuel weight of the aircraft in tons',
    example: 189.507,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 3 })
  zeroFuelWeight!: number;

  @ApiProperty({
    description: 'Fuel on board in tons',
    example: 11.5,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 3 })
  blockFuel!: number;

  @ApiProperty({
    description:
      'Structured planned fuel breakdown in tons. `block` matches the `blockFuel` summary.',
    type: () => FuelBreakdown,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FuelBreakdown)
  fuel?: FuelBreakdown | null;
}

export class Loadsheets {
  @ApiProperty({
    description: 'Loadsheet filled by operations team for pilots',
    type: Loadsheet,
    nullable: true,
  })
  @Type(() => Loadsheet)
  preliminary!: Loadsheet | null;

  @ApiProperty({
    description: 'Loadsheet filled by pilots when finished boarding',
    type: Loadsheet,
    nullable: true,
  })
  @Type(() => Loadsheet)
  final!: Loadsheet | null;
}
