import { composeNotoc } from './notoc';
import {
  DANGEROUS_GOODS_STATEMENT,
  NO_DANGEROUS_GOODS_STATEMENT,
} from './notoc.model';
import {
  CargoContentClassName,
  CargoShipmentEntry,
  CargoShipmentStatusName,
  CargoUnitEntry,
  FlightCargoManifest,
} from './cargo-manifest.model';
import { LoadUnitKind } from './cargo-packing';
import { CargoDeck } from './hold-layout.model';
import { UldType } from './uld';
import { TransferRole } from './shipment-journey';
import { ColdChainRisk, ColdChainAssessment } from './cold-chain';
import {
  DangerousGoodsProfile,
  HazardClass,
  PackingGroup,
  SpecialHandlingCode,
  TemperatureRegime,
  TemperatureSolution,
} from './commodity.model';

function shipment(
  overrides: Partial<CargoShipmentEntry> = {},
): CargoShipmentEntry {
  return {
    awb: '001-48203713',
    commodity: 'printed-matter',
    description: 'Books, palletised',
    pieces: 68,
    grossKg: 1500,
    volumeM3: 2.143,
    shc: [] as SpecialHandlingCode[],
    shipper: 'Bauer Verlag GmbH',
    consignee: 'Whitaker Distribution LLC',
    origin: 'FRA',
    destination: 'JFK',
    transferRole: TransferRole.Local,
    onwardCarrier: null,
    onwardFlightNumber: null,
    connectionMinutes: null,
    connectionAtRisk: false,
    dangerousGoods: null,
    coldChain: null,
    status: CargoShipmentStatusName.Loaded,
    offloadReason: null,
    offloadedFrom: null,
    ...overrides,
  };
}

function unit(
  shipments: CargoShipmentEntry[],
  overrides: Partial<CargoUnitEntry> = {},
): CargoUnitEntry {
  return {
    kind: LoadUnitKind.Uld,
    uldCode: 'AKE48201AA',
    uldType: UldType.Ld3,
    positionDesignator: '11L',
    compartment: 1,
    deck: CargoDeck.Lower,
    tareKg: 82,
    grossKg: shipments.reduce((sum, entry) => sum + entry.grossKg, 0),
    volumeM3: 2.143,
    contentClass: CargoContentClassName.Cargo,
    beyondDestination: null,
    sealed: false,
    bagCount: null,
    priority: false,
    ...overrides,
    shipments,
  };
}

function manifest(units: CargoUnitEntry[]): FlightCargoManifest {
  const cargoKg = units.reduce(
    (sum, entry) => sum + entry.tareKg + entry.grossKg,
    0,
  );

  return {
    flightId: 'd2601432-e8cb-4018-8cee-f24aaaa29ca5',
    holdVariant: 'b77w-ld3',
    cargoKg,
    baggageKg: 0,
    bagCount: 0,
    baggageSource: null,
    containerCount: units.length,
    bulkLotCount: 0,
    shipmentCount: units.reduce(
      (sum, entry) => sum + entry.shipments.length,
      0,
    ),
    worstColdChainRisk: null,
    dangerousGoodsCount: 0,
    cargoAircraftOnlyCount: 0,
    transferCount: 0,
    tightestConnectionMinutes: null,
    compartmentLoad: [
      { compartment: 1, deck: CargoDeck.Lower, weightKg: cargoKg, dryIceKg: 0 },
    ],
    segregationAdvisories: [],
    units,
  };
}

const paint: DangerousGoodsProfile = {
  unNumber: 'UN1263',
  properShippingName: 'Paint',
  hazardClass: HazardClass.FlammableLiquid,
  subsidiaryRisk: null,
  packingGroup: PackingGroup.Medium,
  netPerPackage: '5 L',
  cargoAircraftOnly: false,
  ercCode: '3L',
};

const chilled: ColdChainAssessment = {
  regime: TemperatureRegime.Cool,
  minC: 2,
  maxC: 8,
  solution: TemperatureSolution.Passive,
  setPointC: null,
  enduranceHours: 48,
  exposureHours: 14.1,
  marginHours: 33.9,
  risk: ColdChainRisk.Low,
  explanation: 'A passive shipper with 33.9 h margin on a 48 h endurance.',
  advisory: true,
};

describe('composeNotoc', () => {
  it('states in as many words that nothing hazardous is aboard', () => {
    const document = composeNotoc(manifest([unit([shipment()])]), 'JFK');

    expect(document.statement).toBe(NO_DANGEROUS_GOODS_STATEMENT);
    expect(document.dangerousGoods).toEqual([]);
  });

  it('reports a dangerous goods shipment in full, with its drill', () => {
    const document = composeNotoc(
      manifest([
        unit([
          shipment({
            awb: '001-11111118',
            commodity: 'paint',
            description: 'Architectural paint, tins',
            pieces: 24,
            shc: [SpecialHandlingCode.FlammableLiquid],
            dangerousGoods: paint,
          }),
        ]),
      ]),
      'JFK',
    );

    expect(document.statement).toBe(DANGEROUS_GOODS_STATEMENT);
    expect(document.dangerousGoods).toEqual([
      {
        awb: '001-11111118',
        properShippingName: 'Paint',
        unNumber: 'UN1263',
        hazardClass: HazardClass.FlammableLiquid,
        subsidiaryRisk: null,
        packingGroup: PackingGroup.Medium,
        packages: 24,
        netPerPackage: '5 L',
        position: '11L',
        compartment: 1,
        unloadingAirport: 'JFK',
        cargoAircraftOnly: false,
        drill: {
          ercCode: '3L',
          inherentRisk: expect.stringContaining('Flammable liquid'),
          riskToAircraftAndOccupants: expect.stringContaining('fire'),
          spillAndFireProcedure: expect.stringContaining('ignition source'),
          additionalRisks: ['No significant risk beyond the drill itself.'],
        },
      },
    ]);
  });

  it('keeps a dangerous goods shipment out of the special loads section', () => {
    const document = composeNotoc(
      manifest([
        unit([
          shipment({
            commodity: 'radiopharmaceuticals',
            shc: [
              SpecialHandlingCode.Pharmaceuticals,
              SpecialHandlingCode.RadioactiveYellow,
            ],
            dangerousGoods: paint,
          }),
        ]),
      ]),
      'JFK',
    );

    expect(document.dangerousGoods).toHaveLength(1);
    expect(document.specialLoads).toEqual([]);
  });

  it('reports a notifiable load that is not dangerous goods', () => {
    const document = composeNotoc(
      manifest([
        unit([
          shipment({
            awb: '001-22222225',
            commodity: 'horses',
            description: 'Sport horses in stalls',
            grossKg: 2400,
            shc: [SpecialHandlingCode.LiveAnimals, SpecialHandlingCode.Heavy],
          }),
        ]),
      ]),
      'JFK',
    );

    expect(document.specialLoads).toHaveLength(1);
    expect(document.specialLoads[0]).toMatchObject({
      awb: '001-22222225',
      shc: [SpecialHandlingCode.LiveAnimals, SpecialHandlingCode.Heavy],
      grossKg: 2400,
      position: '11L',
      compartment: 1,
      unloadingAirport: 'JFK',
    });
  });

  it('leaves ordinary freight out of the special loads section', () => {
    const document = composeNotoc(manifest([unit([shipment()])]), 'JFK');

    expect(document.specialLoads).toEqual([]);
  });

  it('reports the largest piece of an outsized load', () => {
    const document = composeNotoc(
      manifest([
        unit([
          shipment({
            commodity: 'engine-fan-blades',
            shc: [SpecialHandlingCode.Heavy],
            grossKg: 1472,
          }),
        ]),
      ]),
      'JFK',
    );

    expect(document.specialLoads[0].heaviestPiece).not.toBeNull();
    expect(document.specialLoads[0].heaviestPiece!.kg).toBeGreaterThan(0);
  });

  it('carries the cold chain assessment and marks it advisory', () => {
    const document = composeNotoc(
      manifest([
        unit([
          shipment({
            awb: '001-33333332',
            commodity: 'insulin',
            description: 'Insulin, insulated shipper',
            shc: [
              SpecialHandlingCode.Pharmaceuticals,
              SpecialHandlingCode.Cool,
            ],
            coldChain: chilled,
          }),
        ]),
      ]),
      'JFK',
    );

    expect(document.coldChain).toEqual([
      {
        awb: '001-33333332',
        description: 'Insulin, insulated shipper',
        regime: TemperatureRegime.Cool,
        risk: ColdChainRisk.Low,
        marginHours: 33.9,
        explanation: chilled.explanation,
        advisory: true,
      },
    ]);
  });

  it('counts containers, pallets and loose lots separately', () => {
    const document = composeNotoc(
      manifest([
        unit([shipment()], { uldType: UldType.Ld3, positionDesignator: '11L' }),
        unit([shipment()], {
          uldType: UldType.Pallet96,
          positionDesignator: '21P',
        }),
        unit([shipment()], {
          kind: LoadUnitKind.BulkLot,
          uldType: null,
          uldCode: null,
          positionDesignator: null,
          tareKg: 0,
        }),
      ]),
      'JFK',
    );

    expect(document.summary.containerCount).toBe(1);
    expect(document.summary.palletCount).toBe(1);
    expect(document.summary.looseLotCount).toBe(1);
  });

  it('leaves a unit emptied by offloading out of the unit counts', () => {
    const document = composeNotoc(
      manifest([
        unit([shipment()]),
        unit([], {
          positionDesignator: null,
          tareKg: 0,
          grossKg: 0,
          uldCode: 'AKE48202AA',
        }),
      ]),
      'JFK',
    );

    expect(document.summary.containerCount).toBe(1);
  });

  it('reports the deadload and the tightest onward connection', () => {
    const load = manifest([
      unit([
        shipment({ onwardCarrier: 'DL', connectionMinutes: 240 }),
        shipment({ awb: '001-2', onwardCarrier: 'AC', connectionMinutes: 95 }),
      ]),
    ]);
    load.baggageKg = 2000;

    const document = composeNotoc(load, 'JFK');

    expect(document.summary.beyondCount).toBe(2);
    expect(document.summary.tightestConnectionMinutes).toBe(95);
    expect(document.summary.deadloadKg).toBe(load.cargoKg + 2000);
  });

  it('describes only what is still loaded', () => {
    const document = composeNotoc(
      manifest([
        unit([
          shipment({ shc: [SpecialHandlingCode.LiveAnimals] }),
          shipment({
            awb: '001-2',
            shc: [SpecialHandlingCode.Valuable],
            status: CargoShipmentStatusName.Offloaded,
          }),
        ]),
      ]),
      'JFK',
    );

    expect(document.specialLoads).toHaveLength(1);
    expect(document.specialLoads[0].shc).toEqual(['AVI']);
  });

  it('carries the compartment load, dry ice included', () => {
    const load = manifest([
      unit([shipment({ shc: [SpecialHandlingCode.DryIce] })]),
    ]);
    load.compartmentLoad = [
      {
        compartment: 1,
        deck: CargoDeck.Lower,
        weightKg: 1582,
        dryIceKg: 120,
      },
    ];

    expect(composeNotoc(load, 'JFK').summary.compartments).toEqual([
      { compartment: 1, deck: CargoDeck.Lower, weightKg: 1582, dryIceKg: 120 },
    ]);
  });
});
