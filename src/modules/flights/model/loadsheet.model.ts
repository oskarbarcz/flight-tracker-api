import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  CountRecord,
  IsCountRecord,
} from '../../../core/validation/is-count-record.validator';
import { Type } from 'class-transformer';

export enum LoadsheetKind {
  Preliminary = 'preliminary',
  Final = 'final',
}

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
    type: String,
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
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
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

export type PassengerCounts = CountRecord;

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

  @ApiPropertyOptional({
    description:
      'Planned passengers per commercial cabin, keyed as the cabin layout names them; must sum to `passengers`. Omit to let the system spread passengers across the cabins in proportion to their size.',
    example: { business: 20, economy: 130 },
    type: 'object',
    additionalProperties: { type: 'number' },
    nullable: true,
  })
  @IsOptional()
  @IsCountRecord()
  passengersByCabin?: PassengerCounts | null;

  @ApiPropertyOptional({
    description:
      'Mass per passenger in kilograms the loadsheet was planned with, used as the floor its payload is measured against. Derived from the imported flight plan and ignored on write; absent when no plan stated one, in which case the standard adult mass applies.',
    example: 80,
    nullable: true,
    type: Number,
    readOnly: true,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 1 })
  passengerMass?: number | null;

  @ApiProperty({
    description: 'Cargo in tons',
    example: 3.5,
  })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 3 })
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

export class FlightLoadsheet extends Loadsheet {
  @ApiProperty({
    description: 'Loadsheet unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  id!: string;

  @ApiProperty({
    description:
      'Kind of loadsheet <br />' +
      '**preliminary**: planned by the operations team; a flight keeps every revision it was issued.<br />' +
      '**final**: settled by the crew when boarding finished; a flight has at most one.',
    enum: LoadsheetKind,
    example: LoadsheetKind.Preliminary,
  })
  kind!: LoadsheetKind;

  @ApiProperty({
    description:
      'Revision of the loadsheet within its kind, counting from 1. A final loadsheet is always revision 1.',
    example: 2,
  })
  revision!: number;

  @ApiProperty({
    description:
      'Identifier of the user who issued the loadsheet, or null where the issuer is no longer known',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
    nullable: true,
    type: String,
  })
  issuedById!: string | null;

  @ApiProperty({
    description: 'Time when the loadsheet was issued',
    example: '2025-01-01T00:00:00.000Z',
    type: 'string',
  })
  issuedAt!: Date;
}
