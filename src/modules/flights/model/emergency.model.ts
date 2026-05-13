import { Coordinates } from '../../airports/model/airport.model';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum EmergencyUrgency {
  Mayday = 'mayday',
  PanPan = 'panpan',
  Silent = 'silent',
}

export enum EmergencyThreatLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export enum EmergencyCategory {
  Ata21AirConditioning = 'ata-21-air-conditioning',
  Ata23Communications = 'ata-23-communications',
  Ata24ElectricalPower = 'ata-24-electrical-power',
  Ata26FireProtection = 'ata-26-fire-protection',
  Ata27FlightControls = 'ata-27-flight-controls',
  Ata28FuelSystem = 'ata-28-fuel-system',
  Ata29Hydraulics = 'ata-29-hydraulics',
  Ata30IceRainProtection = 'ata-30-ice-rain-protection',
  Ata32LandingGear = 'ata-32-landing-gear',
  Ata34Navigation = 'ata-34-navigation',
  Ata35Oxygen = 'ata-35-oxygen',
  Ata49Apu = 'ata-49-apu',
  Ata52Doors = 'ata-52-doors',
  Ata72Engine = 'ata-72-engine',
  Ata73EngineFuelControl = 'ata-73-engine-fuel-control',
  CabinDecompression = 'cabin-decompression',
  SmokeOrFumes = 'smoke-or-fumes',
  BirdStrike = 'bird-strike',
  SevereTurbulence = 'severe-turbulence',
  SevereWeather = 'severe-weather',
  MedicalEmergency = 'medical-emergency',
  UnlawfulInterference = 'unlawful-interference',
  SecurityThreat = 'security-threat',
  UnrulyPassenger = 'unruly-passenger',
  Other = 'other',
}

export enum SquawkCode {
  General = '7700',
  RadioFailure = '7600',
  Hijack = '7500',
}

export enum EmergencyIntention {
  Continue = 'continue',
  ReturnToDeparture = 'return',
  Divert = 'divert',
  ImmediateLanding = 'immediate-landing',
}

export enum DangerousGoodsClass {
  Class1Explosives = 'class-1-explosives',
  Class2Gases = 'class-2-gases',
  Class3FlammableLiquids = 'class-3-flammable-liquids',
  Class4FlammableSolids = 'class-4-flammable-solids',
  Class5Oxidizers = 'class-5-oxidizers',
  Class6ToxicInfectious = 'class-6-toxic-infectious',
  Class7Radioactive = 'class-7-radioactive',
  Class8Corrosives = 'class-8-corrosives',
  Class9Miscellaneous = 'class-9-miscellaneous',
}

export class EmergencyParticipant {
  @ApiProperty({
    description: 'User unique system identifier.',
    example: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
  })
  id!: string;

  @ApiProperty({
    description: 'User first and last name.',
    example: 'Rick Doe',
  })
  name!: string;
}

export class Emergency {
  @ApiProperty({
    description: 'Emergency declaration unique system identifier.',
    example: 'a77e0b1c-2944-4bdf-9e6a-0b1c2d3e4f5a',
  })
  id!: string;

  @ApiProperty({
    description:
      'Urgency level of the emergency. `mayday` is a distress signal — immediate danger to the aircraft or souls on board. ' +
      '`panpan` is an urgency signal — a serious situation that does not pose immediate danger. ' +
      '`silent` is a covert declaration recorded internally without an R/T broadcast (e.g. suspected unlawful interference).',
    example: EmergencyUrgency.Mayday,
    enum: EmergencyUrgency,
  })
  @IsEnum(EmergencyUrgency)
  @IsNotEmpty()
  urgency!: EmergencyUrgency;

  @ApiProperty({
    description:
      "Operations' assessment of how severe the situation is for the flight. Independent of `urgency`.",
    example: EmergencyThreatLevel.Critical,
    enum: EmergencyThreatLevel,
  })
  @IsEnum(EmergencyThreatLevel)
  @IsNotEmpty()
  threatLevel!: EmergencyThreatLevel;

  @ApiProperty({
    description:
      'Cause of the emergency. ATA-coded values (e.g. `ata-72-engine`) identify component or system failures; the remaining values cover operational and non-mechanical events.',
    example: EmergencyCategory.Ata72Engine,
    enum: EmergencyCategory,
  })
  @IsEnum(EmergencyCategory)
  @IsNotEmpty()
  category!: EmergencyCategory;

  @ApiProperty({
    description:
      'Transponder squawk code set on the aircraft. `null` when no squawk was set — typical for silent declarations or events without an R/T broadcast.',
    example: SquawkCode.General,
    enum: SquawkCode,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(SquawkCode)
  squawk?: SquawkCode | null = null;

  @ApiProperty({
    description: "Pilot's stated course of action.",
    example: EmergencyIntention.Divert,
    enum: EmergencyIntention,
  })
  @IsEnum(EmergencyIntention)
  @IsNotEmpty()
  intention!: EmergencyIntention;

  @ApiProperty({
    description:
      "Aircraft position at the moment the emergency was declared. `null` when unknown at declaration; the flight's ongoing position-report stream can be used as the fallback record.",
    type: Coordinates,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Coordinates)
  lastKnownPosition?: Coordinates | null = null;

  @ApiProperty({
    description:
      'Souls on board at declaration time. Computed server-side from the latest loadsheet (passengers + pilots + relief pilots + cabin crew) and persisted on the record so it survives subsequent loadsheet amendments.',
    example: 378,
  })
  soulsOnBoard!: number;

  @ApiProperty({
    description: 'Fuel endurance remaining at declaration, in minutes.',
    example: 95,
  })
  @IsInt()
  @Min(0)
  fuelEnduranceMinutes!: number;

  @ApiProperty({
    description:
      'IATA/ICAO dangerous goods classes carried on this flight. Empty array if none. Multiple classes may be carried simultaneously.',
    example: [DangerousGoodsClass.Class3FlammableLiquids],
    enum: DangerousGoodsClass,
    isArray: true,
  })
  @IsArray()
  @IsEnum(DangerousGoodsClass, { each: true })
  dangerousGoodsOnBoard!: DangerousGoodsClass[];

  @ApiProperty({
    description: 'Free-text description providing additional context.',
    example:
      'Engine #2 fire warning, ECAM actions completed, returning to FRA.',
  })
  @IsString()
  @IsNotEmpty()
  freeText!: string;

  @ApiProperty({
    description: 'Server-recorded time when the declaration was made.',
    example: '2026-05-13T12:00:00.000Z',
  })
  declarationTime!: Date;

  @ApiProperty({
    description: 'Cabin-crew member who declared the emergency.',
    type: EmergencyParticipant,
  })
  reportedBy!: EmergencyParticipant;

  @ApiProperty({
    description:
      'Time the emergency was resolved (soft-deleted). `null` while still active.',
    example: '2026-05-13T12:45:00.000Z',
    nullable: true,
  })
  resolvedAt!: Date | null;

  @ApiProperty({
    description:
      'Cabin-crew member who resolved the emergency. `null` while still active.',
    type: EmergencyParticipant,
    nullable: true,
  })
  resolvedBy!: EmergencyParticipant | null;
}
