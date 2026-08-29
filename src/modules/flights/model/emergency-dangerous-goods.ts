import { HazardClass } from '../../manifest/model/commodity.model';
import { DangerousGoodsClass } from './emergency.model';

const CLASS_BY_HAZARD: Record<HazardClass, DangerousGoodsClass> = {
  [HazardClass.Explosives]: DangerousGoodsClass.Class1Explosives,
  [HazardClass.FlammableGas]: DangerousGoodsClass.Class2Gases,
  [HazardClass.NonFlammableGas]: DangerousGoodsClass.Class2Gases,
  [HazardClass.ToxicGas]: DangerousGoodsClass.Class2Gases,
  [HazardClass.FlammableLiquid]: DangerousGoodsClass.Class3FlammableLiquids,
  [HazardClass.FlammableSolid]: DangerousGoodsClass.Class4FlammableSolids,
  [HazardClass.SpontaneouslyCombustible]:
    DangerousGoodsClass.Class4FlammableSolids,
  [HazardClass.DangerousWhenWet]: DangerousGoodsClass.Class4FlammableSolids,
  [HazardClass.Oxidizer]: DangerousGoodsClass.Class5Oxidizers,
  [HazardClass.OrganicPeroxide]: DangerousGoodsClass.Class5Oxidizers,
  [HazardClass.ToxicSubstance]: DangerousGoodsClass.Class6ToxicInfectious,
  [HazardClass.InfectiousSubstance]: DangerousGoodsClass.Class6ToxicInfectious,
  [HazardClass.Radioactive]: DangerousGoodsClass.Class7Radioactive,
  [HazardClass.Corrosive]: DangerousGoodsClass.Class8Corrosives,
  [HazardClass.Miscellaneous]: DangerousGoodsClass.Class9Miscellaneous,
};

const DECLARATION_ORDER: DangerousGoodsClass[] =
  Object.values(DangerousGoodsClass);

export function declarableClassesOf(
  hazardClasses: HazardClass[],
): DangerousGoodsClass[] {
  const declared = new Set(
    hazardClasses
      .map((hazardClass) => CLASS_BY_HAZARD[hazardClass])
      .filter(
        (declarable): declarable is DangerousGoodsClass =>
          declarable !== undefined,
      ),
  );

  return DECLARATION_ORDER.filter((declarable) => declared.has(declarable));
}

export function resolveDangerousGoodsOnBoard(
  supplied: DangerousGoodsClass[] | undefined,
  aboard: HazardClass[],
): DangerousGoodsClass[] {
  return supplied ?? declarableClassesOf(aboard);
}
