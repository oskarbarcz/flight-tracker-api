import {
  CargoContentClass,
  CargoDeck,
  CargoOffloadReason,
  CargoShipmentStatus,
  CargoTransferRole,
  CargoUnitKind,
  NotocStage,
  Prisma,
} from '../../client/client';
import { findCommodityById } from '../../../src/modules/manifest/data/cargo-commodities';
import {
  assessColdChain,
  ColdChainAssessment,
} from '../../../src/modules/manifest/model/cold-chain';
import {
  DangerousGoodsProfile,
  SpecialHandlingCode,
} from '../../../src/modules/manifest/model/commodity.model';
import { dryIceKgOf } from '../../../src/modules/manifest/model/segregation.policy';
import { LoadUnitKind } from '../../../src/modules/manifest/model/cargo-packing';
import { UldType } from '../../../src/modules/manifest/model/uld';
import { TransferRole } from '../../../src/modules/manifest/model/shipment-journey';
import {
  CargoContentClassName,
  CargoShipmentStatusName,
  CargoUnitEntry,
  CompartmentLoad,
  FlightCargoManifest,
} from '../../../src/modules/manifest/model/cargo-manifest.model';
import { CargoDeck as CargoDeckName } from '../../../src/modules/manifest/model/hold-layout.model';
import { composeNotoc } from '../../../src/modules/manifest/model/notoc';

const AA2018 = 'd2601432-e8cb-4018-8cee-f24aaaa29ca5';
const AA2019 = 'dc20c7ff-114e-42be-86cc-34fd90b71b35';
const CV2020 = '2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380';
const AA2021 = 'b4bad5cf-c049-488b-b979-8ef8fc85cdb4';
const AAL4912 = '2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d';
const AAL4911 = '7105891a-8008-4b47-b473-c81c97615ad7';
const AA2022 = '792e3698-b46d-4c1b-bc99-451596660760';
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
  status?: CargoShipmentStatus;
  offloadReason?: CargoOffloadReason;
  offloadedFrom?: string;
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
  {
    id: '20d4d6fb-9696-439e-806a-61a030c430cf',
    flightId: AA2021,
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
        id: 'c5d61371-1eb5-42cc-8a45-25a503ce3666',
        commodityId: 'printed-matter',
        description: 'Books, palletised',
        awb: '001-71844102',
        pieces: 54,
        grossKg: 1200,
        volumeM3: 1.714,
        shc: [],
        shipper: 'Bauer Verlag GmbH',
        consignee: 'Whitaker Distribution LLC',
      },
    ],
  },
  {
    id: 'e3e70682-c209-4cac-a29f-6fbed82c07cd',
    flightId: AAL4912,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '11L',
    uldType: 'AKE',
    uldSerial: '49201',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'f728b4fa-4248-4e3a-8a5d-2f346baa9455',
        commodityId: 'paint',
        description: 'Paint, flammable',
        awb: '001-49201003',
        pieces: 78,
        grossKg: 1400,
        volumeM3: 1.556,
        shc: ['RFL'],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
        dangerousGoods: findCommodityById('paint')!.dangerousGoods,
      },
    ],
  },
  {
    id: 'eb1167b3-67a9-4378-bc65-c1e582e2e662',
    flightId: AAL4912,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '11R',
    uldType: 'AKE',
    uldSerial: '49202',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'f7c1bd87-4da5-4709-9471-3d60c8a70639',
        commodityId: 'lithium-ion-standalone',
        description: 'Lithium ion cells, standalone',
        awb: '001-49201014',
        pieces: 140,
        grossKg: 1400,
        volumeM3: 1.556,
        shc: ['RLI', 'CAO'],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
        dangerousGoods: findCommodityById('lithium-ion-standalone')!
          .dangerousGoods,
      },
    ],
  },
  {
    id: 'e443df78-9558-467f-9ba9-1faf7a024204',
    flightId: AAL4912,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '12L',
    uldType: 'AKE',
    uldSerial: '49203',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: '23a7711a-8133-4876-b7eb-dcd9e87a1613',
        commodityId: 'printed-matter',
        description: 'Books, palletised',
        awb: '001-49201025',
        pieces: 64,
        grossKg: 1400,
        volumeM3: 2.0,
        shc: [],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: '1846d424-c17c-4279-a3c6-612f48268673',
    flightId: AAL4912,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '12R',
    uldType: 'AKE',
    uldSerial: '49204',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'fcbd04c3-4021-4ef7-8ca5-a5a19e4d6e3c',
        commodityId: 'coffee-beans',
        description: 'Speciality green coffee, bagged',
        awb: '001-49201036',
        pieces: 35,
        grossKg: 1400,
        volumeM3: 2.545,
        shc: ['EAT'],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: 'b4862b21-fb97-4435-8856-1712e8e5216a',
    flightId: AAL4912,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 2,
    positionDesignator: '21L',
    uldType: 'AKE',
    uldSerial: '49205',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: '259f4329-e6f4-490b-9a16-4106cf6a659e',
        commodityId: 'printed-matter',
        description: 'Books, palletised',
        awb: '001-49201040',
        pieces: 64,
        grossKg: 1400,
        volumeM3: 2.0,
        shc: [],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: '12e0c8b2-bad6-40fb-9948-8dec4f65d4d9',
    flightId: AAL4912,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 2,
    positionDesignator: '21R',
    uldType: 'AKE',
    uldSerial: '49206',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: '5487ce1e-af19-422a-99b8-a714e61a441c',
        commodityId: 'coffee-beans',
        description: 'Speciality green coffee, bagged',
        awb: '001-49201051',
        pieces: 25,
        grossKg: 1008,
        volumeM3: 1.833,
        shc: ['EAT'],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: '5a921187-19c7-4df4-8f4f-f31e78de5857',
    flightId: AAL4911,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '11L',
    uldType: 'AKE',
    uldSerial: '49301',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'a3f2c9bf-9c63-46b9-90f2-44556f25e2a2',
        commodityId: 'printed-matter',
        description: 'Books, palletised',
        awb: '001-49301000',
        pieces: 64,
        grossKg: 1400,
        volumeM3: 2.0,
        shc: [],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: '8d723104-f773-43c1-b458-a748e9bb17bc',
    flightId: AAL4911,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '11R',
    uldType: 'AKE',
    uldSerial: '49302',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: '85776e9a-dd84-439e-b154-5a137a1d5006',
        commodityId: 'coffee-beans',
        description: 'Speciality green coffee, bagged',
        awb: '001-49301011',
        pieces: 35,
        grossKg: 1400,
        volumeM3: 2.545,
        shc: ['EAT'],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: 'eb2083e6-ce16-4dba-8ff1-8e0242af9fc3',
    flightId: AAL4911,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '12L',
    uldType: 'AKE',
    uldSerial: '49303',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: '17e0aa3c-0398-4ca8-aa7e-9d498c778ea6',
        commodityId: 'printed-matter',
        description: 'Books, palletised',
        awb: '001-49301022',
        pieces: 64,
        grossKg: 1400,
        volumeM3: 2.0,
        shc: [],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: 'b5d32b16-6619-4cb1-9710-37d1b83e90ec',
    flightId: AAL4911,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 1,
    positionDesignator: '12R',
    uldType: 'AKE',
    uldSerial: '49304',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'a0116be5-ab0c-4681-88f8-e3d0d3290a4c',
        commodityId: 'coffee-beans',
        description: 'Speciality green coffee, bagged',
        awb: '001-49301033',
        pieces: 35,
        grossKg: 1400,
        volumeM3: 2.545,
        shc: ['EAT'],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: 'd3fbf47a-7e5b-4e7f-9ca5-499d004ae545',
    flightId: AAL4911,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 2,
    positionDesignator: '21L',
    uldType: 'AKE',
    uldSerial: '49305',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'baf3897a-3e70-416a-9548-5822de1b372a',
        commodityId: 'printed-matter',
        description: 'Books, palletised',
        awb: '001-49301044',
        pieces: 64,
        grossKg: 1400,
        volumeM3: 2.0,
        shc: [],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: '101fbccc-ded7-43e8-b421-eaeb534097ca',
    flightId: AAL4911,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 2,
    positionDesignator: '21R',
    uldType: 'AKE',
    uldSerial: '49306',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: '38c1962e-9148-424f-aac1-c14f30e9c5cc',
        commodityId: 'coffee-beans',
        description: 'Speciality green coffee, bagged',
        awb: '001-49301055',
        pieces: 25,
        grossKg: 1008,
        volumeM3: 1.833,
        shc: ['EAT'],
        shipper: 'Rhein-Main Forwarding GmbH',
        consignee: 'Liberty Freight Services Inc.',
      },
    ],
  },
  {
    id: '07eca074-f00e-4cc8-b5be-fff211adba5d',
    flightId: AA2022,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 3,
    positionDesignator: '31L',
    uldType: 'AKE',
    uldSerial: '55101',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: '9d941f40-0593-4da6-8dba-a2dfb98370b1',
        commodityId: 'pets-in-hold',
        description: 'Domestic pets in travel kennels',
        awb: '001-55102202',
        pieces: 12,
        grossKg: 400,
        volumeM3: 2.0,
        shc: ['AVIH'],
        shipper: 'Rhein-Main Pet Travel GmbH',
        consignee: 'Queens Animal Reception Inc.',
      },
    ],
  },
  {
    id: 'f8165df1-0761-4c9c-910f-6ef24a2febc4',
    flightId: AA2022,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 3,
    positionDesignator: '31R',
    uldType: 'AKE',
    uldSerial: '55102',
    uldOwner: 'AA',
    tareKg: 82,
    shipments: [
      {
        id: 'd7582f29-1ab7-4a5d-b5f9-bbd5057edcae',
        commodityId: 'dry-ice',
        description: 'Carbon dioxide, solid, as refrigerant',
        awb: '001-55102213',
        pieces: 64,
        grossKg: 1400,
        volumeM3: 2.0,
        shc: ['ICE'],
        shipper: 'Hessen Kaeltetechnik GmbH',
        consignee: 'Brooklyn Cold Logistics Inc.',
        dangerousGoods: findCommodityById('dry-ice')!.dangerousGoods,
      },
    ],
  },
  {
    id: '21f104c8-93c2-4aee-b213-62f78e9e1b51',
    flightId: AA2022,
    kind: CargoUnitKind.uld,
    deck: CargoDeck.lower,
    compartment: 3,
    positionDesignator: null,
    uldType: 'AKE',
    uldSerial: '55103',
    uldOwner: 'AA',
    tareKg: 0,
    shipments: [
      {
        id: 'c233972f-547b-4197-a869-6eef26fb8b9d',
        commodityId: 'radiopharmaceuticals',
        description: 'Radiopharmaceutical doses, shielded',
        awb: '001-55102224',
        pieces: 6,
        grossKg: 120,
        volumeM3: 0.1,
        shc: ['PIL', 'RRY'],
        shipper: 'Marburg Isotopes GmbH',
        consignee: 'Bayside Nuclear Medicine Inc.',
        dangerousGoods: findCommodityById('radiopharmaceuticals')!
          .dangerousGoods,
        status: CargoShipmentStatus.offloaded,
        offloadReason: CargoOffloadReason.payload_restriction,
        offloadedFrom: '32L',
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
            shc: shipment.shc as SpecialHandlingCode[],
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
            status: shipment.status ?? CargoShipmentStatus.loaded,
            offloadReason: shipment.offloadReason ?? null,
            offloadedFrom: shipment.offloadedFrom ?? null,
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
  {
    flightId: AA2021,
    issuedAt: new Date('2025-06-02 07:45'),
    acknowledgedAt: null,
  },
];

function grossOf(unit: UnitFixture): number {
  return unit.shipments
    .filter((shipment) => shipment.status !== CargoShipmentStatus.offloaded)
    .reduce((sum, shipment) => sum + shipment.grossKg, 0);
}

function volumeOf(unit: UnitFixture): number {
  return (
    Math.round(
      unit.shipments
        .filter((shipment) => shipment.status !== CargoShipmentStatus.offloaded)
        .reduce((sum, shipment) => sum + shipment.volumeM3, 0) * 1000,
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
    segregationAdvisories: [],
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
      shc: shipment.shc as SpecialHandlingCode[],
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
