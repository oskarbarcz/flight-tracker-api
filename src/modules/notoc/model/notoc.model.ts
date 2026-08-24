import { ApiProperty } from '@nestjs/swagger';
import { NotocChanges } from './notoc-delta';
import { CargoDeck } from '../../cargo/model/hold-layout.model';
import {
  HazardClass,
  HeaviestPiece,
  PackingGroup,
  TemperatureRegime,
} from '../../cargo/model/commodity.model';
import { ColdChainRisk } from '../../cargo/model/cold-chain';

export enum NotocStageName {
  Preliminary = 'preliminary',
  Final = 'final',
}

export const NO_DANGEROUS_GOODS_STATEMENT = 'No dangerous goods loaded.';
export const DANGEROUS_GOODS_STATEMENT =
  'Dangerous goods loaded as listed below.';

export class NotocDrill {
  @ApiProperty({ example: '3L' })
  ercCode!: string;

  @ApiProperty({
    example:
      'Flammable liquid or solid; vapours may form an explosive mixture.',
  })
  inherentRisk!: string;

  @ApiProperty({
    example:
      'Rapid fire spread and dense smoke; heat may weaken structure and burn anyone in reach.',
  })
  riskToAircraftAndOccupants!: string;

  @ApiProperty({
    example:
      'Contain the spill and keep every ignition source away. Fight the fire with water spray, foam, dry chemical or carbon dioxide.',
  })
  spillAndFireProcedure!: string;

  @ApiProperty({
    description: 'Risks the drill letters add on top of the drill number',
    example: ['No significant risk beyond the drill itself.'],
    isArray: true,
    type: String,
  })
  additionalRisks!: string[];
}

export class NotocDangerousGoods {
  @ApiProperty({ example: '020-53729071' })
  awb!: string;

  @ApiProperty({ example: 'Paint' })
  properShippingName!: string;

  @ApiProperty({ example: 'UN1263' })
  unNumber!: string;

  @ApiProperty({ enum: HazardClass, example: HazardClass.FlammableLiquid })
  hazardClass!: HazardClass;

  @ApiProperty({ enum: HazardClass, nullable: true })
  subsidiaryRisk!: HazardClass | null;

  @ApiProperty({ enum: PackingGroup, nullable: true })
  packingGroup!: PackingGroup | null;

  @ApiProperty({ description: 'Packages declared', example: 24 })
  packages!: number;

  @ApiProperty({ example: '5 L' })
  netPerPackage!: string;

  @ApiProperty({
    description:
      'Hold position the load occupies; null for loose load and for an aircraft whose type carries no curated hold data',
    example: '12R',
    nullable: true,
  })
  position!: string | null;

  @ApiProperty({ example: 1, nullable: true })
  compartment!: number | null;

  @ApiProperty({
    description: 'Airport the load comes off this aircraft at',
    example: 'JFK',
  })
  unloadingAirport!: string;

  @ApiProperty({
    description: 'Whether the load may travel only on a cargo aircraft',
    example: false,
  })
  cargoAircraftOnly!: boolean;

  @ApiProperty({ type: NotocDrill })
  drill!: NotocDrill;
}

export class NotocSpecialLoad {
  @ApiProperty({ example: '020-53729071' })
  awb!: string;

  @ApiProperty({ example: 'Live tropical fish, boxed' })
  description!: string;

  @ApiProperty({
    description: 'IATA special handling codes that make the load notifiable',
    example: ['AVI'],
    isArray: true,
    type: String,
  })
  shc!: string[];

  @ApiProperty({ example: 640 })
  grossKg!: number;

  @ApiProperty({ example: '31L', nullable: true })
  position!: string | null;

  @ApiProperty({ example: 3, nullable: true })
  compartment!: number | null;

  @ApiProperty({ example: 'JFK' })
  unloadingAirport!: string;

  @ApiProperty({
    description:
      'Weight and dimensions of the largest piece, reported for heavy and outsized loads only',
    nullable: true,
    type: Object,
  })
  heaviestPiece!: HeaviestPiece | null;
}

export class NotocColdChain {
  @ApiProperty({ example: '020-53729071' })
  awb!: string;

  @ApiProperty({ example: 'Vaccines, insulated shipper' })
  description!: string;

  @ApiProperty({ enum: TemperatureRegime })
  regime!: TemperatureRegime;

  @ApiProperty({ enum: ColdChainRisk })
  risk!: ColdChainRisk;

  @ApiProperty({ example: 85.9 })
  marginHours!: number;

  @ApiProperty({
    example: 'An active container with 85.9 h margin on a 100 h endurance.',
  })
  explanation!: string;

  @ApiProperty({
    description:
      'Always true: the assessment informs the captain and gates nothing',
    example: true,
  })
  advisory!: boolean;
}

export class NotocCompartmentLoad {
  @ApiProperty({ example: 1 })
  compartment!: number;

  @ApiProperty({ enum: CargoDeck })
  deck!: CargoDeck;

  @ApiProperty({ example: 6104 })
  weightKg!: number;

  @ApiProperty({ example: 132 })
  dryIceKg!: number;
}

export class NotocLoadSummary {
  @ApiProperty({ type: NotocCompartmentLoad, isArray: true })
  compartments!: NotocCompartmentLoad[];

  @ApiProperty({ description: 'Containers aboard', example: 12 })
  containerCount!: number;

  @ApiProperty({ description: 'Pallets aboard', example: 2 })
  palletCount!: number;

  @ApiProperty({ description: 'Loose lots aboard', example: 1 })
  looseLotCount!: number;

  @ApiProperty({ description: 'Cargo weight, tare included', example: 18000 })
  cargoKg!: number;

  @ApiProperty({ description: 'Baggage weight', example: 2400 })
  baggageKg!: number;

  @ApiProperty({
    description: 'Everything below the floor: cargo, baggage and mail',
    example: 20400,
  })
  deadloadKg!: number;

  @ApiProperty({
    description: 'Shipments continuing beyond this flight',
    example: 3,
  })
  beyondCount!: number;

  @ApiProperty({
    description:
      'Tightest onward connection among them, in minutes; null when nothing continues',
    example: 95,
    nullable: true,
  })
  tightestConnectionMinutes!: number | null;
}

export class NotocDocument {
  @ApiProperty({
    description:
      'Says in as many words whether dangerous goods are aboard, so a clean flight carries a statement rather than an empty document',
    example: NO_DANGEROUS_GOODS_STATEMENT,
  })
  statement!: string;

  @ApiProperty({ type: NotocDangerousGoods, isArray: true })
  dangerousGoods!: NotocDangerousGoods[];

  @ApiProperty({ type: NotocSpecialLoad, isArray: true })
  specialLoads!: NotocSpecialLoad[];

  @ApiProperty({ type: NotocColdChain, isArray: true })
  coldChain!: NotocColdChain[];

  @ApiProperty({ type: NotocLoadSummary })
  summary!: NotocLoadSummary;
}

export class FlightNotoc {
  @ApiProperty({ example: 'c0e83544-cefd-41c8-9c60-aadfaaf08590' })
  flightId!: string;

  @ApiProperty({ enum: NotocStageName })
  stage!: NotocStageName;

  @ApiProperty({ example: '2025-06-02T08:10:00.000Z' })
  issuedAt!: Date;

  @ApiProperty({
    description: 'Pilot who accepted the document; null until they do',
    example: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
    nullable: true,
  })
  acknowledgedById!: string | null;

  @ApiProperty({ example: '2025-06-02T08:40:00.000Z', nullable: true })
  acknowledgedAt!: Date | null;

  @ApiProperty({ type: NotocDocument })
  document!: NotocDocument;

  @ApiProperty({
    description:
      'What changed since the preliminary document; null on the preliminary one itself',
    nullable: true,
    type: Object,
  })
  changes!: NotocChanges | null;
}
