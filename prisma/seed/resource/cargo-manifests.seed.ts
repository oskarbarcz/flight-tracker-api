import {
  CargoContentClass,
  CargoDeck,
  CargoTransferRole,
  CargoUnitKind,
  Prisma,
} from '../../client/client';

const AA2018 = 'd2601432-e8cb-4018-8cee-f24aaaa29ca5';
const AA2019 = 'dc20c7ff-114e-42be-86cc-34fd90b71b35';

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
        pieces: 68,
        grossKg: 1500,
        volumeM3: 2.143,
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
        pieces: 50,
        grossKg: 800,
        volumeM3: 3.636,
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
        grossKg: 1472,
        volumeM3: 2.453,
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
];

export async function loadCargoManifests(
  tx: Prisma.TransactionClient,
): Promise<void> {
  for (const unit of UNITS) {
    const { shipments, ...fields } = unit;
    const grossKg = shipments.reduce(
      (sum, shipment) => sum + shipment.grossKg,
      0,
    );
    const volumeM3 =
      Math.round(
        shipments.reduce((sum, shipment) => sum + shipment.volumeM3, 0) * 1000,
      ) / 1000;

    await tx.flightCargoUnit.create({
      data: {
        ...fields,
        grossKg,
        volumeM3,
        contentClass: CargoContentClass.cargo,
        beyondDestination: null,
        sealed: false,
        bagCount: null,
        priority: false,
        baggageSource: null,
        shipments: {
          create: shipments.map((shipment) => ({
            ...shipment,
            flightId: unit.flightId,
            origin: 'FRA',
            destination: 'JFK',
            transferRole: CargoTransferRole.local,
            onwardCarrier: null,
            onwardFlightNumber: null,
            connectionMinutes: null,
          })),
        },
      },
    });
  }
}
