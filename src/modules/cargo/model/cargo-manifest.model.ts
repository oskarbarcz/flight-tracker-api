import { ApiProperty } from '@nestjs/swagger';
import { CargoDeck } from './hold-layout.model';
import { LoadUnitKind } from './cargo-packing';
import { UldType } from './uld';

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

  @ApiProperty({ enum: CargoShipmentStatusName })
  status!: CargoShipmentStatusName;
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

  @ApiProperty({ type: CompartmentLoad, isArray: true })
  compartmentLoad!: CompartmentLoad[];

  @ApiProperty({ type: CargoUnitEntry, isArray: true })
  units!: CargoUnitEntry[];
}
