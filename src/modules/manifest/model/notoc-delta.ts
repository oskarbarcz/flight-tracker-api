import { NotocDocument } from './notoc.model';

export type NotocReposition = {
  awb: string;
  from: string | null;
  to: string | null;
};

export type NotocChanges = {
  changed: boolean;
  dangerousGoodsAdded: string[];
  dangerousGoodsRemoved: string[];
  specialLoadsAdded: string[];
  specialLoadsRemoved: string[];
  repositioned: NotocReposition[];
  cargoChangeKg: number;
  deadloadChangeKg: number;
};

export function notocChanges(
  preliminary: NotocDocument,
  final: NotocDocument,
): NotocChanges {
  const dangerousGoodsAdded = missingFrom(
    final.dangerousGoods,
    preliminary.dangerousGoods,
  );
  const dangerousGoodsRemoved = missingFrom(
    preliminary.dangerousGoods,
    final.dangerousGoods,
  );
  const specialLoadsAdded = missingFrom(
    final.specialLoads,
    preliminary.specialLoads,
  );
  const specialLoadsRemoved = missingFrom(
    preliminary.specialLoads,
    final.specialLoads,
  );
  const repositioned = repositionsBetween(preliminary, final);
  const cargoChangeKg = final.summary.cargoKg - preliminary.summary.cargoKg;
  const deadloadChangeKg =
    final.summary.deadloadKg - preliminary.summary.deadloadKg;

  return {
    changed:
      dangerousGoodsAdded.length > 0 ||
      dangerousGoodsRemoved.length > 0 ||
      specialLoadsAdded.length > 0 ||
      specialLoadsRemoved.length > 0 ||
      repositioned.length > 0 ||
      cargoChangeKg !== 0 ||
      deadloadChangeKg !== 0,
    dangerousGoodsAdded,
    dangerousGoodsRemoved,
    specialLoadsAdded,
    specialLoadsRemoved,
    repositioned,
    cargoChangeKg,
    deadloadChangeKg,
  };
}

function missingFrom(
  entries: { awb: string }[],
  reference: { awb: string }[],
): string[] {
  const known = new Set(reference.map((entry) => entry.awb));

  return entries
    .map((entry) => entry.awb)
    .filter((awb) => !known.has(awb))
    .sort();
}

function repositionsBetween(
  preliminary: NotocDocument,
  final: NotocDocument,
): NotocReposition[] {
  const before = positionsOf(preliminary);
  const after = positionsOf(final);

  return [...after.entries()]
    .filter(([awb, to]) => before.has(awb) && before.get(awb) !== to)
    .map(([awb, to]) => ({ awb, from: before.get(awb) ?? null, to }))
    .sort((one, other) => one.awb.localeCompare(other.awb));
}

function positionsOf(document: NotocDocument): Map<string, string | null> {
  return new Map(
    [...document.dangerousGoods, ...document.specialLoads].map((entry) => [
      entry.awb,
      entry.position,
    ]),
  );
}
