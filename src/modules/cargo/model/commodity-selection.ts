import { Continent } from '../../airports/model/airport.model';
import { Commodity } from './commodity.model';
import { COMMODITIES } from '../data/cargo-commodities';

export enum SourceTier {
  Airport = 'airport',
  Country = 'country',
  Continent = 'continent',
  Generic = 'generic',
}

export type DepartureContext = {
  iataCode: string;
  country: string;
  continent: Continent;
  month: number;
};

export type OfferedCommodity = {
  commodity: Commodity;
  tier: SourceTier;
  weight: number;
};

const TIER_WEIGHT: Record<SourceTier, number> = {
  [SourceTier.Airport]: 4,
  [SourceTier.Country]: 3,
  [SourceTier.Continent]: 2,
  [SourceTier.Generic]: 1,
};

const PEAK_MULTIPLIER = 2;

export function isGeneric(commodity: Commodity): boolean {
  const { airports, countries, continents } = commodity.sources;

  return (
    airports.length === 0 && countries.length === 0 && continents.length === 0
  );
}

export function tierOf(
  commodity: Commodity,
  context: DepartureContext,
): SourceTier | null {
  if (commodity.sources.airports.includes(context.iataCode)) {
    return SourceTier.Airport;
  }

  if (commodity.sources.countries.includes(context.country)) {
    return SourceTier.Country;
  }

  if (commodity.sources.continents.includes(context.continent)) {
    return SourceTier.Continent;
  }

  return isGeneric(commodity) ? SourceTier.Generic : null;
}

export function isInSeason(commodity: Commodity, month: number): boolean {
  return commodity.months.includes(month);
}

export function offeredCommodities(
  context: DepartureContext,
  catalogue: readonly Commodity[] = COMMODITIES,
): OfferedCommodity[] {
  const offered: OfferedCommodity[] = [];

  for (const commodity of catalogue) {
    if (!isInSeason(commodity, context.month)) {
      continue;
    }

    const tier = tierOf(commodity, context);

    if (!tier) {
      continue;
    }

    const peaking = commodity.peakMonths.includes(context.month);
    const weight =
      commodity.frequency * TIER_WEIGHT[tier] * (peaking ? PEAK_MULTIPLIER : 1);

    offered.push({ commodity, tier, weight });
  }

  return offered.sort(
    (one, other) =>
      other.weight - one.weight ||
      one.commodity.id.localeCompare(other.commodity.id),
  );
}

export function selectCommodities(
  context: DepartureContext,
  catalogue: readonly Commodity[] = COMMODITIES,
): Commodity[] {
  return offeredCommodities(context, catalogue).map((offer) => offer.commodity);
}

export function drawCommodity(
  offered: OfferedCommodity[],
  roll: number,
): Commodity {
  const total = offered.reduce((sum, offer) => sum + offer.weight, 0);
  let cursor = roll * total;

  for (const offer of offered) {
    cursor -= offer.weight;

    if (cursor < 0) {
      return offer.commodity;
    }
  }

  return offered[offered.length - 1].commodity;
}
