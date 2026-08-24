import { ApiProperty } from '@nestjs/swagger';
import { CargoDeck } from './hold-layout.model';
import { LoadUnitKind } from './cargo-packing';
import { UldType } from './uld';
import { TransferRole } from './shipment-journey';
import { DangerousGoodsProfile } from './commodity.model';
import { ColdChainAssessment, ColdChainRisk } from './cold-chain';
import { BaggageSource } from './baggage';
import { OffloadReason } from './cargo-reconciliation';

export enum CargoContentClassName {
  Cargo = 'cargo',
  Baggage = 'baggage',
  Mail = 'mail',
}

export enum CargoShipmentStatusName {
  Loaded = 'loaded',
  Offloaded = 'offloaded',
}

export class CargoShipmentEntry {
  @ApiProperty({
    description:
      'Air waybill number: a three-digit carrier prefix, a seven-digit serial and a check digit equal to that serial modulo seven',
    example: '020-53729071',
  })
  awb!: string;

  @ApiProperty({
    description: 'Commodity the shipment was drawn from',
    example: 'flowers-roses',
  })
  commodity!: string;

  @ApiProperty({ example: 'Cut roses, 40cm stems' })
  description!: string;

  @ApiProperty({ description: 'Number of pieces declared', example: 84 })
  pieces!: number;

  @ApiProperty({ description: 'Gross weight in kilograms', example: 1204 })
  grossKg!: number;

  @ApiProperty({ description: 'Volume in cubic metres', example: 4.3 })
  volumeM3!: number;

  @ApiProperty({
    description: 'IATA special handling codes the shipment carries',
    example: ['PER', 'PEF'],
    isArray: true,
    type: String,
  })
  shc!: string[];

  @ApiProperty({ example: 'Bauer AG' })
  shipper!: string;

  @ApiProperty({ example: 'Dupont SARL' })
  consignee!: string;

  @ApiProperty({
    description:
      'Airport the shipment was raised at, which may precede this flight',
    example: 'BLR',
  })
  origin!: string;

  @ApiProperty({
    description:
      'Airport the shipment is destined for, which may lie beyond this flight',
    example: 'YYZ',
  })
  destination!: string;

  @ApiProperty({
    description:
      'What the shipment is doing on this flight, read from its origin against the departure and its destination against the arrival',
    enum: TransferRole,
    example: TransferRole.ThroughTransfer,
  })
  transferRole!: TransferRole;

  @ApiProperty({
    description:
      'Carrier the shipment continues on; null when it terminates here',
    example: 'AC',
    nullable: true,
  })
  onwardCarrier!: string | null;

  @ApiProperty({
    description:
      'Flight the shipment continues on; null when it terminates here',
    example: 'AC8802',
    nullable: true,
  })
  onwardFlightNumber!: string | null;

  @ApiProperty({
    description:
      'Minutes available to make the onward connection; null when the shipment terminates here',
    example: 205,
    nullable: true,
  })
  connectionMinutes!: number | null;

  @ApiProperty({
    description:
      'Whether the onward connection falls below the minimum a transfer needs, so the shipment is at risk of missing it',
    example: false,
  })
  connectionAtRisk!: boolean;

  @ApiProperty({
    description:
      'Dangerous goods declaration: UN number, proper shipping name, hazard class and division, subsidiary risk, packing group, net quantity per package, cargo aircraft restriction and emergency response code. Null for a shipment carrying no dangerous goods.',
    nullable: true,
    example: {
      unNumber: '3480',
      properShippingName: 'Lithium ion batteries',
      hazardClass: '9',
      subsidiaryRisk: null,
      packingGroup: 'II',
      netPerPackage: '10 kg',
      cargoAircraftOnly: true,
      ercCode: '9F',
    },
  })
  dangerousGoods!: DangerousGoodsProfile | null;

  @ApiProperty({
    description:
      'Cold chain assessment for a temperature-controlled shipment: the regime it must be kept within, the solution carrying it, its endurance, the exposure across this flight and any onward leg, the resulting margin, a risk level and the reasoning behind it. Advisory only: it blocks no release and no loading. Null for a shipment needing no temperature control.',
    nullable: true,
    example: {
      regime: 'COL',
      minC: 2,
      maxC: 8,
      solution: 'active',
      setPointC: 5,
      enduranceHours: 100,
      exposureHours: 14.1,
      marginHours: 85.9,
      risk: 'low',
      explanation:
        'An active container with 85.9 h margin on a 100 h endurance.',
      advisory: true,
    },
  })
  coldChain!: ColdChainAssessment | null;

  @ApiProperty({ enum: CargoShipmentStatusName })
  status!: CargoShipmentStatusName;

  @ApiProperty({
    description: 'Why the shipment was left behind, once it has been offloaded',
    enum: OffloadReason,
    nullable: true,
  })
  offloadReason!: OffloadReason | null;

  @ApiProperty({
    description:
      'Position the shipment had been loaded in before it was offloaded',
    example: '12R',
    nullable: true,
  })
  offloadedFrom!: string | null;
}

export class CargoUnitEntry {
  @ApiProperty({
    description:
      'Whether the load is in a unit load device or loose in a compartment',
    enum: LoadUnitKind,
    example: LoadUnitKind.Uld,
  })
  kind!: LoadUnitKind;

  @ApiProperty({
    description:
      'Full device identifier: IATA type code, serial and owner code. Null for loose load.',
    example: 'AKE40218LH',
    nullable: true,
  })
  uldCode!: string | null;

  @ApiProperty({
    description: 'IATA ULD type code; null for loose load',
    enum: UldType,
    nullable: true,
  })
  uldType!: UldType | null;

  @ApiProperty({
    description:
      'Hold position the device occupies, composed of compartment number, ordinal and side. This is a convention of this system, not a published designation. Null for loose load and for an aircraft whose type carries no curated hold data.',
    example: '12R',
    nullable: true,
  })
  positionDesignator!: string | null;

  @ApiProperty({
    description:
      'Compartment number, counted from the nose; null when the hold configuration is unknown',
    example: 1,
    nullable: true,
  })
  compartment!: number | null;

  @ApiProperty({
    description:
      'Deck the load sits on; null when the hold configuration is unknown',
    enum: CargoDeck,
    nullable: true,
  })
  deck!: CargoDeck | null;

  @ApiProperty({ description: 'Tare weight in kilograms', example: 82 })
  tareKg!: number;

  @ApiProperty({
    description: 'Weight of the contents in kilograms, excluding tare',
    example: 1204,
  })
  grossKg!: number;

  @ApiProperty({ description: 'Volume the contents occupy', example: 4.3 })
  volumeM3!: number;

  @ApiProperty({ enum: CargoContentClassName })
  contentClass!: CargoContentClassName;

  @ApiProperty({
    description:
      'Point beyond this flight the unit was built for; null when the unit is broken down on arrival',
    example: 'YYZ',
    nullable: true,
  })
  beyondDestination!: string | null;

  @ApiProperty({
    description:
      'Whether the unit transfers intact to its beyond point rather than being broken down on arrival',
    example: false,
  })
  sealed!: boolean;

  @ApiProperty({
    description: 'Bags the unit holds; null for a unit holding cargo or mail',
    example: 42,
    nullable: true,
  })
  bagCount!: number | null;

  @ApiProperty({
    description:
      'Whether the unit holds premium cabin baggage, which comes off first',
    example: false,
  })
  priority!: boolean;

  @ApiProperty({ type: CargoShipmentEntry, isArray: true })
  shipments!: CargoShipmentEntry[];
}

export class CompartmentLoad {
  @ApiProperty({ example: 1 })
  compartment!: number;

  @ApiProperty({ enum: CargoDeck })
  deck!: CargoDeck;

  @ApiProperty({
    description: 'Weight carried in the compartment, tare included',
    example: 6104,
  })
  weightKg!: number;

  @ApiProperty({
    description:
      'Dry ice carried in the compartment, in kilograms. Dry ice is an asphyxiant, so its quantity is reported per compartment.',
    example: 132,
  })
  dryIceKg!: number;
}

export class FlightCargoManifest {
  @ApiProperty({ example: 'c0e83544-cefd-41c8-9c60-aadfaaf08590' })
  flightId!: string;

  @ApiProperty({
    description:
      'Hold variant the load was planned against; null when the airframe type carries no curated hold data, in which case no unit has a position or a compartment',
    example: 'b77w-ld3',
    nullable: true,
  })
  holdVariant!: string | null;

  @ApiProperty({
    description:
      'Cargo weight the manifest accounts for, tare included, in kilograms',
    example: 3500,
  })
  cargoKg!: number;

  @ApiProperty({ description: 'Units carrying cargo in devices', example: 4 })
  containerCount!: number;

  @ApiProperty({ description: 'Loose lots of cargo', example: 1 })
  bulkLotCount!: number;

  @ApiProperty({
    description:
      'Shipments the manifest reports, counting only those matching the status filter when one is given',
    example: 7,
  })
  shipmentCount!: number;

  @ApiProperty({
    description: 'Shipments carrying dangerous goods',
    example: 4,
  })
  dangerousGoodsCount!: number;

  @ApiProperty({
    description:
      'Highest cold chain risk aboard; null when the flight carries no temperature-controlled load. Advisory only.',
    enum: ColdChainRisk,
    nullable: true,
    example: ColdChainRisk.Elevated,
  })
  worstColdChainRisk!: ColdChainRisk | null;

  @ApiProperty({
    description:
      'Shipments restricted to cargo aircraft; always zero on a flight carrying passengers',
    example: 1,
  })
  cargoAircraftOnlyCount!: number;

  @ApiProperty({
    description: 'Shipments continuing beyond this flight',
    example: 3,
  })
  transferCount!: number;

  @ApiProperty({
    description:
      'Shortest onward connection among the shipments continuing beyond this flight, in minutes; null when none continue',
    example: 65,
    nullable: true,
  })
  tightestConnectionMinutes!: number | null;

  @ApiProperty({
    description:
      'Baggage weight in the hold, in kilograms. Kept separate from the cargo tonnage.',
    example: 2207,
  })
  baggageKg!: number;

  @ApiProperty({ description: 'Bags in the hold', example: 138 })
  bagCount!: number;

  @ApiProperty({
    description:
      'Whether the baggage weight was reconciled from the loadsheet payload or derived from the passenger count because the payload could not account for it',
    enum: BaggageSource,
    nullable: true,
    example: BaggageSource.Reconciled,
  })
  baggageSource!: BaggageSource | null;

  @ApiProperty({ type: CompartmentLoad, isArray: true })
  compartmentLoad!: CompartmentLoad[];

  @ApiProperty({ type: CargoUnitEntry, isArray: true })
  units!: CargoUnitEntry[];
}
