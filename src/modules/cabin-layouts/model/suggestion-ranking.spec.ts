import { rankCabinLayoutSuggestions } from './suggestion-ranking';
import { CabinLayoutMatch } from './cabin-layout-suggestion.model';
import { CabinLayout } from './cabin-layout.model';

function layout(
  id: string,
  airlineIata: string,
  aircraftIata: string,
): CabinLayout {
  return {
    id,
    airlineIata,
    aircraftIata,
    variant: null,
    sourceSlugs: [id],
    firstSeenAt: new Date('2026-08-01T00:00:00.000Z'),
    retiredAt: null,
  };
}

describe('cabin layout suggestion ranking', () => {
  it('ranks an airline and aircraft type match above partial ones', () => {
    const ranked = rankCabinLayoutSuggestions(
      [
        layout('kl-738', 'KL', '738'),
        layout('aa-738', 'AA', '738'),
        layout('kl-772', 'KL', '772'),
      ],
      'KL',
      '738',
    );

    expect(ranked.map(({ id, match }) => ({ id, match }))).toEqual([
      { id: 'kl-738', match: CabinLayoutMatch.Exact },
      { id: 'kl-772', match: CabinLayoutMatch.Airline },
      { id: 'aa-738', match: CabinLayoutMatch.AircraftType },
    ]);
  });

  it('orders layouts of one rank by identifier', () => {
    const ranked = rankCabinLayoutSuggestions(
      [layout('lo-7m8-3', 'LO', '7M8'), layout('lo-7m8-1', 'LO', '7M8')],
      'LO',
      '7M8',
    );

    expect(ranked.map(({ id }) => id)).toEqual(['lo-7m8-1', 'lo-7m8-3']);
  });

  it('drops layouts matching neither the airline nor the aircraft type', () => {
    const ranked = rankCabinLayoutSuggestions(
      [layout('aa-77w', 'AA', '77W')],
      'KL',
      '738',
    );

    expect(ranked).toEqual([]);
  });

  it('matches on the aircraft type alone when the aircraft has no IATA code', () => {
    const ranked = rankCabinLayoutSuggestions(
      [layout('kl-738', 'KL', '738')],
      'KL',
      null,
    );

    expect(ranked.map(({ match }) => match)).toEqual([
      CabinLayoutMatch.Airline,
    ]);
  });

  it('suggests nothing when neither code is known', () => {
    expect(
      rankCabinLayoutSuggestions([layout('kl-738', 'KL', '738')], null, null),
    ).toEqual([]);
  });

  it('keeps retired layouts, marked as retired', () => {
    const retired = {
      ...layout('kl-738', 'KL', '738'),
      retiredAt: new Date('2026-08-10T00:00:00.000Z'),
    };

    const ranked = rankCabinLayoutSuggestions([retired], 'KL', '738');

    expect(ranked).toHaveLength(1);
    expect(ranked[0].retiredAt).toEqual(new Date('2026-08-10T00:00:00.000Z'));
  });
});
