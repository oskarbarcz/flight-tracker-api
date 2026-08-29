import {
  declarableClassesOf,
  resolveDangerousGoodsOnBoard,
} from './emergency-dangerous-goods';
import { DangerousGoodsClass } from './emergency.model';
import { HazardClass } from '../../manifest/model/commodity.model';

describe('declarableClassesOf', () => {
  it('collapses the three gas divisions into one declarable class', () => {
    expect(
      declarableClassesOf([
        HazardClass.FlammableGas,
        HazardClass.NonFlammableGas,
        HazardClass.ToxicGas,
      ]),
    ).toEqual([DangerousGoodsClass.Class2Gases]);
  });

  it('collapses the flammable solid divisions into one declarable class', () => {
    expect(
      declarableClassesOf([
        HazardClass.FlammableSolid,
        HazardClass.SpontaneouslyCombustible,
        HazardClass.DangerousWhenWet,
      ]),
    ).toEqual([DangerousGoodsClass.Class4FlammableSolids]);
  });

  it('reports each distinct class once, in class order', () => {
    expect(
      declarableClassesOf([
        HazardClass.Corrosive,
        HazardClass.FlammableLiquid,
        HazardClass.Explosives,
        HazardClass.FlammableLiquid,
      ]),
    ).toEqual([
      DangerousGoodsClass.Class1Explosives,
      DangerousGoodsClass.Class3FlammableLiquids,
      DangerousGoodsClass.Class8Corrosives,
    ]);
  });

  it('knows a declarable class for every hazard class the catalogue uses', () => {
    const unmapped = Object.values(HazardClass).filter(
      (hazardClass) => declarableClassesOf([hazardClass]).length === 0,
    );

    expect(unmapped).toEqual([]);
  });

  it('reports nothing when nothing hazardous is aboard', () => {
    expect(declarableClassesOf([])).toEqual([]);
  });
});

describe('resolveDangerousGoodsOnBoard', () => {
  it('fills the declaration from the load when the pilot states nothing', () => {
    expect(
      resolveDangerousGoodsOnBoard(undefined, [
        HazardClass.FlammableLiquid,
        HazardClass.Miscellaneous,
      ]),
    ).toEqual([
      DangerousGoodsClass.Class3FlammableLiquids,
      DangerousGoodsClass.Class9Miscellaneous,
    ]);
  });

  it('keeps what the pilot stated, even where the load says otherwise', () => {
    expect(
      resolveDangerousGoodsOnBoard(
        [DangerousGoodsClass.Class7Radioactive],
        [HazardClass.FlammableLiquid],
      ),
    ).toEqual([DangerousGoodsClass.Class7Radioactive]);
  });

  it('keeps an explicit empty declaration rather than filling it', () => {
    expect(
      resolveDangerousGoodsOnBoard([], [HazardClass.FlammableLiquid]),
    ).toEqual([]);
  });

  it('reports none when the pilot states nothing and nothing is aboard', () => {
    expect(resolveDangerousGoodsOnBoard(undefined, [])).toEqual([]);
  });
});
