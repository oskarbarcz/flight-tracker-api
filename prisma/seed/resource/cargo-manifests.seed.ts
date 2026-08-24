import {
  CargoContentClass,
  CargoDeck,
  CargoTransferRole,
  CargoUnitKind,
  NotocStage,
  Prisma,
} from '../../client/client';
import { findCommodityById } from '../../../src/modules/cargo/data/cargo-commodities';
import {
  assessColdChain,
  ColdChainAssessment,
} from '../../../src/modules/cargo/model/cold-chain';
import {
  DangerousGoodsProfile,
  SpecialHandlingCode,
} from '../../../src/modules/cargo/model/commodity.model';
import { dryIceKgOf } from '../../../src/modules/cargo/model/segregation.policy';
import { LoadUnitKind } from '../../../src/modules/cargo/model/cargo-packing';
import { UldType } from '../../../src/modules/cargo/model/uld';
import { TransferRole } from '../../../src/modules/cargo/model/shipment-journey';
import {
  CargoContentClassName,
  CargoShipmentStatusName,
  CargoUnitEntry,
  CompartmentLoad,
  FlightCargoManifest,
} from '../../../src/modules/cargo/model/cargo-manifest.model';
import { CargoDeck as CargoDeckName } from '../../../src/modules/cargo/model/hold-layout.model';
import { composeNotoc } from '../../../src/modules/notoc/model/notoc';

const AA2018 = 'd2601432-e8cb-4018-8cee-f24aaaa29ca5';
const AA2019 = 'dc20c7ff-114e-42be-86cc-34fd90b71b35';
const CV2020 = '2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380';
const RICK = 'fcf6f4bc-290d-43a9-843c-409cd47e143d';
const UNLOADING_AIRPORT = 'JFK';

function vaccineColdChain(): ColdChainAssessment {
  return assessColdChain(findCommodityById('vaccines')!.temperature!, {
    buildUpHours: 3,
    flightHours: 8.5,
    connectionHours: null,
    onwardFlightHours: null,
    ambientC: null,
  });
}

type ShipmentFixture = {
  id: string;
  commodityId: string;
  description: string;
  awb: string;
  pieces: number;
  grossKg: number;
  volumeM3: number;
  shc: string[];
  shipper: string;
  consignee: string;
  dangerousGoods?: DangerousGoodsProfile;
  coldChain?: ColdChainAssessment;
};

type UnitFixture = {
  id: string;
  flightId: string;
  kind: CargoUnitKind;
  deck: CargoDeck | null;
  compartment: number | null;
  positionDesignator: string | null;
  uldType: string | null;
  uldSerial: string | null;
  uldOwner: string | null;
  tareKg: number;
  shipments: ShipmentFixture[];
};

const UNITS: UnitFixture[] = [
  {
    id: '01b499cb-3706-4775-869c-7aef09fbdf2b',
    flightId: AA2018,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '11L',
    uldType: 'AKE',
    uldSerial: '48201',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: '60d1c270-63d2-4a85-9af0-f2234b84b373',
        commodityId: 'printed-matter',
        description: 'Books, palletised',
        awb: '001-48203713',
        pieces: 64,
        grossKg: 1418,
        volumeM3: 2.026,
        shc: [],
        shipper: 'Bauer Verlag GmbH',
        consignee: 'Whitaker Distribution LLC',
      },
    ],
  },
  {
    id: '2212b90e-018a-4bbf-86e7-dbeb4acaf27a',
    flightId: AA2018,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '11R',
    uldType: 'AKE',
    uldSerial: '48202',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'a287eecf-70ba-4e06-bb10-4236e8549230',
        commodityId: 'coffee-beans',
        description: 'Speciality green coffee, bagged',
        awb: '001-48203724',
        pieces: 35,
        grossKg: 1400,
        volumeM3: 2.545,
        shc: ['EAT'],
        shipper: 'Rheinhafen Rohkaffee GmbH',
        consignee: 'Hudson Roasting Co.',
      },
    ],
  },
  {
    id: '253ea3c2-13bf-479f-8933-008eabd5ab53',
    flightId: AA2018,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '12L',
    uldType: 'AKE',
    uldSerial: '48203',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'a728ebda-35ea-4df8-a1c1-f51e7d7cad6c',
        commodityId: 'medical-devices',
        description: 'Sterile medical devices',
        awb: '001-48203735',
        pieces: 56,
        grossKg: 900,
        volumeM3: 4.091,
        shc: ['PIL'],
        shipper: 'Kirchner Medizintechnik GmbH',
        consignee: 'Bayside Hospital Supply Inc.',
      },
    ],
  },
  {
    id: '297eb192-41f4-474d-8967-e4b8cc980163',
    flightId: AA2018,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '12R',
    uldType: 'AKE',
    uldSerial: '48204',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'b5d4ea30-8d78-48be-83a4-79b5f1badea5',
        commodityId: 'engine-fan-blades',
        description: 'Turbofan blade set, AOG',
        awb: '001-48203746',
        pieces: 4,
        grossKg: 1454,
        volumeM3: 2.423,
        shc: ['HEA'],
        shipper: 'Rhein-Main Aero Services GmbH',
        consignee: 'Kennedy Line Maintenance Inc.',
      },
    ],
  },
  {
    id: '41a1d11c-0786-4de6-a58a-5ca9c4639033',
    flightId: AA2019,
    kind: CargoUnitKind.bulk_lot,
    deck: null,
    compartment: null,
    positionDesignator: null,
    uldType: null,
    uldSerial: null,
    uldOwner: null,
    tareKg: 0,
    shipments: [
      {
        id: 'ce0d18ce-c235-4e82-90bb-60cb7266215a',
        commodityId: 'printed-matter',
        description: 'Books, palletised',
        awb: '001-51309101',
        pieces: 120,
        grossKg: 3000,
        volumeM3: 4.286,
        shc: [],
        shipper: 'Bauer Verlag GmbH',
        consignee: 'Whitaker Distribution LLC',
      },
    ],
  },
  {
    id: '0927545e-c8e7-46a5-a0cb-4c1aa30c5b57',
    flightId: CV2020,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.main,
    compartment: 6,
    positionDesignator: '6AL',
    uldType: 'AMA',
    uldSerial: '62011',
    uldOwner: 'CV',
    tareKg: 300,
    shipments: [
      {
        id: '7a6ef7e8-ed3c-4159-ba1b-a68bab74f0b3',
        commodityId: 'horses',
        description: 'Live horses in air stalls',
        awb: '172-62001100',
        pieces: 7,
        grossKg: 4000,
        volumeM3: 16,
        shc: ['AVI', 'HEA'],
        shipper: 'Niederrhein Bloodstock GmbH',
        consignee: 'Belmont Equine Transport Inc.',
      },
    ],
  },
  {
    id: '29d6c96c-c4d2-41ec-a1b6-4d5749bd1bf1',
    flightId: CV2020,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.main,
    compartment: 6,
    positionDesignator: '6BL',
    uldType: 'AMA',
    uldSerial: '62012',
    uldOwner: 'CV',
    tareKg: 300,
    shipments: [
      {
        id: '7bbf31cc-253a-4ddd-925a-3c026c5c88a1',
        commodityId: 'landing-gear',
        description: 'Main landing gear leg, AOG',
        awb: '172-62001111',
        pieces: 4,
        grossKg: 4200,
        volumeM3: 6,
        shc: ['HEA', 'BIG'],
        shipper: 'Rhein-Main Aero Services GmbH',
        consignee: 'Kennedy Line Maintenance Inc.',
      },
    ],
  },
  {
    id: '32821b75-d470-44cb-90ae-f0a491eaa24e',
    flightId: CV2020,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.main,
    compartment: 6,
    positionDesignator: '6CL',
    uldType: 'AMA',
    uldSerial: '62013',
    uldOwner: 'CV',
    tareKg: 300,
    shipments: [
      {
        id: '8b0bfd25-fd98-46dd-a9d8-dcbdd2aa5195',
        commodityId: 'human-remains',
        description: 'Human remains in coffin',
        awb: '172-62001122',
        pieces: 6,
        grossKg: 1072,
        volumeM3: 5.36,
        shc: ['HUM', 'HEA'],
        shipper: 'Sankt Georg Bestattungen GmbH',
        consignee: 'Queens Funeral Directors Inc.',
      },
    ],
  },
  {
    id: '579b8935-0b86-4aac-88a4-f30677b62e3f',
    flightId: CV2020,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '11L',
    uldType: 'AKE',
    uldSerial: '62014',
    uldOwner: 'CV',
    tareKg: 82,
    shipments: [
      {
        id: '8b4d2842-e355-4d62-9262-2a9b74361123',
        commodityId: 'paint',
        description: 'Paint, flammable',
        awb: '172-62001133',
        pieces: 78,
        grossKg: 1400,
        volumeM3: 1.556,
        shc: ['RFL'],
        shipper: 'Odenwald Lackfabrik GmbH',
        consignee: 'Atlantic Coatings Inc.',
        dangerousGoods: findCommodityById('paint')!.dangerousGoods,
      },
    ],
  },
  {
    id: '64016206-d953-40e8-9766-55a28c1eba21',
    flightId: CV2020,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '11R',
    uldType: 'AKE',
    uldSerial: '62015',
    uldOwner: 'CV',
    tareKg: 82,
    shipments: [
      {
        id: '9658f32f-3c06-4d75-ab26-4bae376357b6',
        commodityId: 'lithium-ion-standalone',
        description: 'Lithium ion cells, standalone',
        awb: '172-62001144',
        pieces: 140,
        grossKg: 1400,
        volumeM3: 1.556,
        shc: ['RLI', 'CAO'],
        shipper: 'Taunus Zelltechnik GmbH',
        consignee: 'Hudson Power Systems Inc.',
        dangerousGoods: findCommodityById('lithium-ion-standalone')!
          .dangerousGoods,
      },
    ],
  },
  {
    id: '6f2a5d2d-c56d-4d74-91a6-d918ec7ad4c2',
    flightId: CV2020,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '12L',
    uldType: 'AKE',
    uldSerial: '62016',
    uldOwner: 'CV',
    tareKg: 82,
    shipments: [
      {
        id: '9eaa714d-11f2-492a-8c1c-49f59ea0e869',
        commodityId: 'dry-ice',
        description: 'Carbon dioxide, solid, as refrigerant',
        awb: '172-62001155',
        pieces: 41,
        grossKg: 900,
        volumeM3: 1.286,
        shc: ['ICE'],
        shipper: 'Hessen Kaeltetechnik GmbH',
        consignee: 'Brooklyn Cold Logistics Inc.',
        dangerousGoods: findCommodityById('dry-ice')!.dangerousGoods,
      },
    ],
  },
  {
    id: '78a0446d-fa53-47e8-ba3b-4c1237eaf511',
    flightId: CV2020,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 3,
    positionDesignator: '31L',
    uldType: 'AKE',
    uldSerial: '62017',
    uldOwner: 'CV',
    tareKg: 82,
    shipments: [
      {
        id: 'b3241f30-1792-4255-9207-018c7396e06f',
        commodityId: 'vaccines',
        description: 'Vaccine doses, 2-8C',
        awb: '172-62001166',
        pieces: 50,
        grossKg: 700,
        volumeM3: 3.889,
        shc: ['PIL', 'COL', 'ACT'],
        shipper: 'Marburg Biologicals GmbH',
        consignee: 'Long Island Vaccine Depot Inc.',
        coldChain: vaccineColdChain(),
      },
    ],
  },
];

export async function loadCargoManifests(
  tx: Prisma.TransactionClient,
): Promise<void> {
  for (const unit of UNITS) {
    const { shipments, ...fields } = unit;

    await tx.flightCargoUnit.create({
      data: {
        ...fields,
        grossKg: grossOf(unit),
        volumeM3: volumeOf(unit),
        contentClass: CargoContentClass.cargo,
        beyondDestination: null,
        sealed: false,
        bagCount: null,
        priority: false,
        baggageSource: null,
        shipments: {
          create: shipments.map((shipment) => ({
            id: shipment.id,
            commodityId: shipment.commodityId,
            description: shipment.description,
            awb: shipment.awb,
            pieces: shipment.pieces,
            grossKg: shipment.grossKg,
            volumeM3: shipment.volumeM3,
            shc: shipment.shc,
            shipper: shipment.shipper,
            consignee: shipment.consignee,
            flightId: unit.flightId,
            origin: 'FRA',
            destination: UNLOADING_AIRPORT,
            transferRole: CargoTransferRole.local,
            onwardCarrier: null,
            onwardFlightNumber: null,
            connectionMinutes: null,
            dangerousGoods: shipment.dangerousGoods
              ? (shipment.dangerousGoods as unknown as Prisma.InputJsonValue)
              : Prisma.DbNull,
            temperatureControl: shipment.coldChain
              ? (shipment.coldChain as unknown as Prisma.InputJsonValue)
              : Prisma.DbNull,
          })),
        },
      },
    });
  }

  for (const notoc of NOTOCS) {
    await tx.flightNotoc.create({
      data: {
        flightId: notoc.flightId,
        stage: NotocStage.preliminary,
        issuedAt: notoc.issuedAt,
        document: composeNotoc(
          manifestOf(notoc.flightId),
          UNLOADING_AIRPORT,
        ) as unknown as Prisma.InputJsonValue,
        acknowledgedById: notoc.acknowledgedAt ? RICK : null,
        acknowledgedAt: notoc.acknowledgedAt,
      },
    });
  }
}

const NOTOCS = [
  {
    flightId: AA2018,
    issuedAt: new Date('2025-06-02 07:30'),
    acknowledgedAt: new Date('2025-06-02 08:00'),
  },
  {
    flightId: AA2019,
    issuedAt: new Date('2025-06-02 07:35'),
    acknowledgedAt: new Date('2025-06-02 08:05'),
  },
  {
    flightId: CV2020,
    issuedAt: new Date('2025-06-02 07:40'),
    acknowledgedAt: null,
  },
];

function grossOf(unit: UnitFixture): number {
  return unit.shipments.reduce((sum, shipment) => sum + shipment.grossKg, 0);
}

function volumeOf(unit: UnitFixture): number {
  return (
    Math.round(
      unit.shipments.reduce((sum, shipment) => sum + shipment.volumeM3, 0) *
        1000,
    ) / 1000
  );
}

function manifestOf(flightId: string): FlightCargoManifest {
  const units = UNITS.filter((unit) => unit.flightId === flightId).map(
    toUnitEntry,
  );
  const cargoKg = units.reduce(
    (sum, unit) => sum + unit.tareKg + unit.grossKg,
    0,
  );

  return {
    flightId,
    holdVariant: null,
    cargoKg,
    baggageKg: 0,
    bagCount: 0,
    baggageSource: null,
    containerCount: units.filter((unit) => unit.kind === LoadUnitKind.Uld)
      .length,
    bulkLotCount: units.filter((unit) => unit.kind === LoadUnitKind.BulkLot)
      .length,
    shipmentCount: units.reduce((sum, unit) => sum + unit.shipments.length, 0),
    worstColdChainRisk: null,
    dangerousGoodsCount: 0,
    cargoAircraftOnlyCount: 0,
    transferCount: 0,
    tightestConnectionMinutes: null,
    compartmentLoad: compartmentLoadOf(units),
    units,
  };
}

function toUnitEntry(unit: UnitFixture): CargoUnitEntry {
  return {
    kind: unit.kind as unknown as LoadUnitKind,
    uldCode:
      unit.uldType && unit.uldSerial && unit.uldOwner
        ? `${unit.uldType}${unit.uldSerial}${unit.uldOwner}`
        : null,
    uldType: (unit.uldType as UldType) ?? null,
    positionDesignator: unit.positionDesignator,
    compartment: unit.compartment,
    deck: (unit.deck as unknown as CargoDeckName) ?? null,
    tareKg: unit.tareKg,
    grossKg: grossOf(unit),
    volumeM3: volumeOf(unit),
    contentClass: CargoContentClassName.Cargo,
    beyondDestination: null,
    sealed: false,
    bagCount: null,
    priority: false,
    shipments: unit.shipments.map((shipment) => ({
      awb: shipment.awb,
      commodity: shipment.commodityId,
      description: shipment.description,
      pieces: shipment.pieces,
      grossKg: shipment.grossKg,
      volumeM3: shipment.volumeM3,
      shc: shipment.shc,
      shipper: shipment.shipper,
      consignee: shipment.consignee,
      origin: 'FRA',
      destination: UNLOADING_AIRPORT,
      transferRole: TransferRole.Local,
      onwardCarrier: null,
      onwardFlightNumber: null,
      connectionMinutes: null,
      connectionAtRisk: false,
      dangerousGoods: shipment.dangerousGoods ?? null,
      coldChain: shipment.coldChain ?? null,
      status: CargoShipmentStatusName.Loaded,
      offloadReason: null,
      offloadedFrom: null,
    })),
  };
}

function compartmentLoadOf(units: CargoUnitEntry[]): CompartmentLoad[] {
  const byCompartment = new Map<string, CompartmentLoad>();

  for (const unit of units) {
    if (unit.compartment === null || unit.deck === null) {
      continue;
    }

    const key = `${unit.deck}/${unit.compartment}`;
    const existing = byCompartment.get(key);
    const weightKg = unit.tareKg + unit.grossKg;
    const dryIceKg = unit.shipments.reduce(
      (sum, shipment) =>
        sum +
        dryIceKgOf(shipment.shc as SpecialHandlingCode[], shipment.grossKg),
      0,
    );

    if (existing) {
      existing.weightKg += weightKg;
      existing.dryIceKg += dryIceKg;
      continue;
    }

    byCompartment.set(key, {
      compartment: unit.compartment,
      deck: unit.deck,
      weightKg,
      dryIceKg,
    });
  }

  return [...byCompartment.values()].sort(
    (one, other) =>
      one.deck.localeCompare(other.deck) || one.compartment - other.compartment,
  );
}
