import { notocChanges } from './notoc-delta';
import {
  DANGEROUS_GOODS_STATEMENT,
  NO_DANGEROUS_GOODS_STATEMENT,
  NotocDangerousGoods,
  NotocDocument,
  NotocSpecialLoad,
} from './notoc.model';
import { HazardClass, PackingGroup } from './commodity.model';
import { CargoDeck } from './hold-layout.model';

function dangerousGoods(
  awb: string,
  position: string | null,
): NotocDangerousGoods {
  return {
    awb,
    properShippingName: 'Paint',
    unNumber: 'UN1263',
    hazardClass: HazardClass.FlammableLiquid,
    subsidiaryRisk: null,
    packingGroup: PackingGroup.Medium,
    packages: 24,
    netPerPackage: '5 L',
    position,
    compartment: 1,
    unloadingAirport: 'JFK',
    cargoAircraftOnly: false,
    drill: {
      ercCode: '3L',
      inherentRisk: 'Flammable liquid or solid.',
      riskToAircraftAndOccupants: 'Rapid fire spread.',
      spillAndFireProcedure: 'Contain the spill.',
      additionalRisks: [],
    },
  };
}

function specialLoad(awb: string, position: string | null): NotocSpecialLoad {
  return {
    awb,
    description: 'Live tropical fish, boxed',
    shc: ['AVI'],
    grossKg: 640,
    position,
    compartment: 3,
    unloadingAirport: 'JFK',
    heaviestPiece: null,
  };
}

function document(
  overrides: Partial<NotocDocument> = {},
  cargoKg = 6000,
  baggageKg = 2000,
): NotocDocument {
  return {
    statement:
      (overrides.dangerousGoods ?? []).length === 0
        ? NO_DANGEROUS_GOODS_STATEMENT
        : DANGEROUS_GOODS_STATEMENT,
    dangerousGoods: [],
    specialLoads: [],
    coldChain: [],
    ...overrides,
    summary: {
      compartments: [
        {
          compartment: 1,
          deck: CargoDeck.Lower,
          weightKg: cargoKg,
          dryIceKg: 0,
        },
      ],
      containerCount: 4,
      palletCount: 0,
      looseLotCount: 0,
      cargoKg,
      baggageKg,
      deadloadKg: cargoKg + baggageKg,
      beyondCount: 0,
      tightestConnectionMinutes: null,
      ...overrides.summary,
    },
  };
}

describe('notocChanges', () => {
  it('reports no change when the load is identical', () => {
    const before = document({
      dangerousGoods: [dangerousGoods('001-1', '11L')],
    });

    expect(notocChanges(before, before)).toEqual({
      changed: false,
      dangerousGoodsAdded: [],
      dangerousGoodsRemoved: [],
      specialLoadsAdded: [],
      specialLoadsRemoved: [],
      repositioned: [],
      cargoChangeKg: 0,
      deadloadChangeKg: 0,
    });
  });

  it('reports a dangerous goods shipment the reconciliation added', () => {
    const before = document({
      dangerousGoods: [dangerousGoods('001-1', '11L')],
    });
    const after = document({
      dangerousGoods: [
        dangerousGoods('001-1', '11L'),
        dangerousGoods('001-2', '11R'),
      ],
    });

    const changes = notocChanges(before, after);

    expect(changes.dangerousGoodsAdded).toEqual(['001-2']);
    expect(changes.dangerousGoodsRemoved).toEqual([]);
    expect(changes.changed).toBe(true);
  });

  it('reports a special load the reconciliation offloaded', () => {
    const before = document({ specialLoads: [specialLoad('001-9', '31L')] });
    const after = document({ specialLoads: [] });

    const changes = notocChanges(before, after);

    expect(changes.specialLoadsRemoved).toEqual(['001-9']);
    expect(changes.specialLoadsAdded).toEqual([]);
    expect(changes.changed).toBe(true);
  });

  it('reports a shipment that moved to another position', () => {
    const before = document({
      dangerousGoods: [dangerousGoods('001-1', '11L')],
    });
    const after = document({
      dangerousGoods: [dangerousGoods('001-1', '21R')],
    });

    expect(notocChanges(before, after).repositioned).toEqual([
      { awb: '001-1', from: '11L', to: '21R' },
    ]);
  });

  it('reports a shipment whose unit lost its position', () => {
    const before = document({ specialLoads: [specialLoad('001-9', '31L')] });
    const after = document({ specialLoads: [specialLoad('001-9', null)] });

    expect(notocChanges(before, after).repositioned).toEqual([
      { awb: '001-9', from: '31L', to: null },
    ]);
  });

  it('does not call an added shipment repositioned', () => {
    const before = document({ dangerousGoods: [] });
    const after = document({
      dangerousGoods: [dangerousGoods('001-2', '11R')],
    });

    const changes = notocChanges(before, after);

    expect(changes.repositioned).toEqual([]);
    expect(changes.dangerousGoodsAdded).toEqual(['001-2']);
  });

  it('reports the change in cargo weight and deadload', () => {
    const before = document({}, 6000, 2000);
    const after = document({}, 4500, 2000);

    const changes = notocChanges(before, after);

    expect(changes.cargoChangeKg).toBe(-1500);
    expect(changes.deadloadChangeKg).toBe(-1500);
    expect(changes.changed).toBe(true);
  });

  it('sorts the shipments it reports', () => {
    const before = document({ dangerousGoods: [] });
    const after = document({
      dangerousGoods: [
        dangerousGoods('001-9', '11L'),
        dangerousGoods('001-2', '11R'),
      ],
    });

    expect(notocChanges(before, after).dangerousGoodsAdded).toEqual([
      '001-2',
      '001-9',
    ]);
  });
});
