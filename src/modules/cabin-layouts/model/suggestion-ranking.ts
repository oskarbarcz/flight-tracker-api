import { CabinLayout } from './cabin-layout.model';
import {
  CabinLayoutMatch,
  CabinLayoutSuggestion,
} from './cabin-layout-suggestion.model';

const ORDER: Record<CabinLayoutMatch, number> = {
  [CabinLayoutMatch.Exact]: 0,
  [CabinLayoutMatch.Airline]: 1,
  [CabinLayoutMatch.AircraftType]: 2,
};

export function rankCabinLayoutSuggestions(
  layouts: CabinLayout[],
  airlineIata: string | null,
  aircraftIata: string | null,
): CabinLayoutSuggestion[] {
  return layouts
    .map((layout) => ({
      ...layout,
      match: matchOf(layout, airlineIata, aircraftIata),
    }))
    .filter(
      (suggestion): suggestion is CabinLayoutSuggestion =>
        suggestion.match !== null,
    )
    .sort(
      (one, other) =>
        ORDER[one.match] - ORDER[other.match] || one.id.localeCompare(other.id),
    );
}

function matchOf(
  layout: CabinLayout,
  airlineIata: string | null,
  aircraftIata: string | null,
): CabinLayoutMatch | null {
  const airlineMatches =
    airlineIata !== null && layout.airlineIata === airlineIata;
  const aircraftMatches =
    aircraftIata !== null && layout.aircraftIata === aircraftIata;

  if (airlineMatches && aircraftMatches) {
    return CabinLayoutMatch.Exact;
  }

  if (airlineMatches) {
    return CabinLayoutMatch.Airline;
  }

  return aircraftMatches ? CabinLayoutMatch.AircraftType : null;
}
