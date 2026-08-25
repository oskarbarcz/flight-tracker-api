import { Commodity } from '../model/commodity.model';
import commodityData from './cargo-commodities.data.json';

export const COMMODITIES: readonly Commodity[] = commodityData as Commodity[];

export function findCommodityById(id: string): Commodity | undefined {
  return COMMODITIES.find((commodity) => commodity.id === id);
}

export function dangerousCommodities(): Commodity[] {
  return COMMODITIES.filter((commodity) => commodity.dangerousGoods);
}

export const COMMODITY_IDS: string[] = COMMODITIES.map(
  (commodity) => commodity.id,
);
