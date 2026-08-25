import * as fs from 'node:fs';
import * as path from 'node:path';
import { COMMODITIES } from './cargo-commodities';
import { offeredCommodities } from '../model/commodity-selection';
import { Continent } from '../../airports/model/airport.model';

const MAX_DANGEROUS_GOODS_SHARE = 0.1;
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

type SeededAirport = {
  iataCode: string;
  country: string;
  continent: Continent;
};

function seededAirports(): SeededAirport[] {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'prisma', 'seed', 'resource', 'airports.seed.ts'),
    'utf8',
  );

  return [...source.matchAll(/iataCode: '([A-Z]{3})',/g)].flatMap((match) => {
    const tail = source.slice(match.index, match.index + 900);
    const country = /country: '([^']+)'/.exec(tail);
    const continent = /continent: Continent\.(\w+)/.exec(tail);

    if (!country || !continent) {
      return [];
    }

    const key = continent[1] as keyof typeof Continent;

    return [
      {
        iataCode: match[1],
        country: country[1],
        continent: Continent[key],
      },
    ];
  });
}

function dangerousGoodsShare(airport: SeededAirport, month: number): number {
  const offered = offeredCommodities({ ...airport, month }, COMMODITIES);
  const total = offered.reduce((sum, offer) => sum + offer.weight, 0);
  const dangerous = offered
    .filter((offer) => offer.commodity.dangerousGoods !== undefined)
    .reduce((sum, offer) => sum + offer.weight, 0);

  return total === 0 ? 0 : dangerous / total;
}

describe('the dangerous goods rate of the offered catalogue', () => {
  it('finds the seeded airports, so a parse failure cannot make this vacuous', () => {
    expect(seededAirports().length).toBeGreaterThan(5);
  });

  it('offers dangerous goods below a tenth of the weight everywhere, in every month', () => {
    const exceeding = seededAirports().flatMap((airport) =>
      MONTHS.filter(
        (month) =>
          dangerousGoodsShare(airport, month) > MAX_DANGEROUS_GOODS_SHARE,
      ).map((month) => `${airport.iataCode}/${month}`),
    );

    expect(exceeding).toEqual([]);
  });

  it('still offers dangerous goods rather than removing them', () => {
    const barren = seededAirports().filter((airport) =>
      MONTHS.every((month) => dangerousGoodsShare(airport, month) === 0),
    );

    expect(barren).toEqual([]);
  });

  it('never promotes a dangerous commodity through a named airport or country', () => {
    const promoted = COMMODITIES.filter(
      (commodity) =>
        commodity.dangerousGoods !== undefined &&
        (commodity.sources.airports.length > 0 ||
          commodity.sources.countries.length > 0),
    ).map((commodity) => commodity.id);

    expect(promoted).toEqual([]);
  });
});
