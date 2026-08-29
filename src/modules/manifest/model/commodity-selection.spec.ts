import {
  drawCommodity,
  isGeneric,
  offeredCommodities,
  selectCommodities,
  SourceTier,
  tierOf,
} from './commodity-selection';
import { Continent } from '../../airports/model/airport.model';
import { findCommodityById } from '../data/cargo-commodities';

const reykjavik = {
  iataCode: 'KEF',
  country: 'IS',
  continent: Continent.Europe,
  month: 6,
};

const boston = {
  iataCode: 'BOS',
  country: 'US',
  continent: Continent.NorthAmerica,
  month: 6,
};

const nowhere = {
  iataCode: 'ZZZ',
  country: 'ZZ',
  continent: Continent.Oceania,
  month: 6,
};

describe('commodity selection', () => {
  it('offers a commodity naming the departure airport', () => {
    const ids = selectCommodities(reykjavik).map((commodity) => commodity.id);

    expect(ids).toContain('cod-fresh');
  });

  it('resolves a named airport at the airport tier', () => {
    expect(tierOf(findCommodityById('cod-fresh')!, reykjavik)).toBe(
      SourceTier.Airport,
    );
  });

  it('resolves a commodity naming the country but not the airport at the country tier', () => {
    const beef = findCommodityById('beef-chilled')!;
    const saoPaulo = {
      iataCode: 'VCP',
      country: 'BR',
      continent: Continent.SouthAmerica,
      month: 6,
    };

    expect(beef.sources.airports).not.toContain('VCP');
    expect(tierOf(beef, saoPaulo)).toBe(SourceTier.Country);
  });

  it('resolves a commodity naming only the continent at the continent tier', () => {
    const tulips = findCommodityById('flowers-tulips')!;
    const munich = {
      iataCode: 'MUC',
      country: 'DE',
      continent: Continent.Europe,
      month: 3,
    };

    expect(tierOf(tulips, munich)).toBe(SourceTier.Continent);
  });

  it('offers generic commodities from an airport nothing names', () => {
    const offered = offeredCommodities(nowhere);

    expect(offered.length).toBeGreaterThan(0);
    expect(offered.map((offer) => offer.commodity.id)).toContain('postal-mail');
    expect(offered.some((offer) => offer.tier === SourceTier.Generic)).toBe(
      true,
    );
  });

  it('falls back to generics alone when no tier matches at all', () => {
    const catalogue = [
      findCommodityById('cod-fresh')!,
      findCommodityById('postal-mail')!,
    ];
    const offered = offeredCommodities(nowhere, catalogue);

    expect(offered).toHaveLength(1);
    expect(offered[0].tier).toBe(SourceTier.Generic);
    expect(offered[0].commodity.id).toBe('postal-mail');
  });

  it('offers generic commodities alongside local ones', () => {
    const ids = selectCommodities(boston).map((commodity) => commodity.id);

    expect(ids).toContain('live-lobster');
    expect(ids).toContain('postal-mail');
  });

  it('prefers the airport tier over looser tiers', () => {
    const offered = offeredCommodities(reykjavik);
    const cod = offered.find((offer) => offer.commodity.id === 'cod-fresh')!;
    const mail = offered.find((offer) => offer.commodity.id === 'postal-mail')!;

    expect(cod.weight).toBeGreaterThan(mail.weight);
  });

  it('withholds a commodity that is out of season', () => {
    const march = selectCommodities({ ...reykjavik, month: 3 });
    const june = selectCommodities({ ...reykjavik, month: 6 });

    expect(march.map((commodity) => commodity.id)).toContain('flowers-tulips');
    expect(june.map((commodity) => commodity.id)).not.toContain(
      'flowers-tulips',
    );
  });

  it('weights a commodity more heavily in its peak month', () => {
    const nairobi = {
      iataCode: 'NBO',
      country: 'KE',
      continent: Continent.Africa,
      month: 2,
    };
    const weightIn = (month: number): number =>
      offeredCommodities({ ...nairobi, month }).find(
        (offer) => offer.commodity.id === 'flowers-roses',
      )!.weight;

    expect(weightIn(2)).toBeGreaterThan(weightIn(4));
  });

  it('recognises a commodity available from anywhere as generic', () => {
    expect(isGeneric(findCommodityById('postal-mail')!)).toBe(true);
    expect(isGeneric(findCommodityById('cod-fresh')!)).toBe(false);
  });

  it('offers something at every seeded airport in every month', () => {
    const seeded = [
      { iataCode: 'FRA', country: 'DE', continent: Continent.Europe },
      { iataCode: 'CDG', country: 'FR', continent: Continent.Europe },
      { iataCode: 'WAW', country: 'PL', continent: Continent.Europe },
      { iataCode: 'KEF', country: 'IS', continent: Continent.Europe },
      { iataCode: 'BRE', country: 'DE', continent: Continent.Europe },
      {
        iataCode: 'JFK',
        country: 'US',
        continent: Continent.NorthAmerica,
      },
      {
        iataCode: 'BOS',
        country: 'US',
        continent: Continent.NorthAmerica,
      },
      {
        iataCode: 'PHL',
        country: 'US',
        continent: Continent.NorthAmerica,
      },
      { iataCode: 'YYR', country: 'CA', continent: Continent.NorthAmerica },
      { iataCode: 'YYT', country: 'CA', continent: Continent.NorthAmerica },
    ];

    const barren = seeded.flatMap((airport) =>
      Array.from({ length: 12 }, (_, index) => index + 1)
        .filter((month) => offeredCommodities({ ...airport, month }).length < 5)
        .map((month) => `${airport.iataCode}/${month}`),
    );

    expect(barren).toEqual([]);
  });

  it('names something specific to each seeded airport that has a speciality', () => {
    const specialityOf = (
      iataCode: string,
      country: string,
      continent: Continent,
    ): string[] =>
      offeredCommodities({ iataCode, country, continent, month: 6 })
        .filter((offer) => offer.tier === SourceTier.Airport)
        .map((offer) => offer.commodity.id);

    expect(specialityOf('KEF', 'Iceland', Continent.Europe)).toContain(
      'cod-fresh',
    );
    expect(
      specialityOf('BOS', 'United States of America', Continent.NorthAmerica),
    ).toContain('live-lobster');
    expect(specialityOf('BRE', 'Germany', Continent.Europe)).toContain(
      'engine-fan-blades',
    );
    expect(specialityOf('CDG', 'France', Continent.Europe)).toContain(
      'cosmetics',
    );
  });

  it('draws a commodity deterministically from a roll', () => {
    const offered = offeredCommodities(reykjavik);

    const total = offered.reduce((sum, offer) => sum + offer.weight, 0);
    const last = offered[offered.length - 1];
    const withinLast = 1 - last.weight / total / 2;

    expect(drawCommodity(offered, 0).id).toBe(offered[0].commodity.id);
    expect(drawCommodity(offered, withinLast).id).toBe(last.commodity.id);
  });
});
