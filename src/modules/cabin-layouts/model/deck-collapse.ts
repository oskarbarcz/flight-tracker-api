import { AerolopaLayout } from '../../../core/provider/aerolopa/type/aerolopa.types';

const DECK_VARIANT = /(?:^|-)([mu])$/;

const DECK_SUFFIX = /-[mu]$/;

export interface CollapsedLayout {
  id: string;
  airlineIata: string;
  aircraftIata: string;
  variant: string | null;
  sourceSlugs: string[];
}

function deckOf(variant: string | null): string | null {
  const match = variant ? DECK_VARIANT.exec(variant) : null;

  return match ? match[1] : null;
}

function baseVariant(variant: string): string | null {
  return variant.replace(DECK_VARIANT, '') || null;
}

function asOwnLayout(layout: AerolopaLayout): CollapsedLayout {
  return {
    id: layout.id,
    airlineIata: layout.airlineIata,
    aircraftIata: layout.aircraftIata,
    variant: layout.variant,
    sourceSlugs: [layout.id],
  };
}

export function collapseDeckPairs(
  layouts: AerolopaLayout[],
): CollapsedLayout[] {
  const standaloneIds = new Set(
    layouts.filter((layout) => !deckOf(layout.variant)).map(({ id }) => id),
  );

  const groups = new Map<string, AerolopaLayout[]>();

  for (const layout of layouts) {
    if (!deckOf(layout.variant)) {
      continue;
    }

    const key = [
      layout.airlineIata,
      layout.aircraftIata,
      baseVariant(layout.variant as string) ?? '',
    ].join('|');

    groups.set(key, [...(groups.get(key) ?? []), layout]);
  }

  const merged = new Map<string, CollapsedLayout>();

  for (const group of groups.values()) {
    const decks = new Set(group.map((layout) => deckOf(layout.variant)));
    const mergedId = group[0].id.replace(DECK_SUFFIX, '');

    if (
      decks.size !== 2 ||
      group.length !== 2 ||
      standaloneIds.has(mergedId) ||
      new Set(group.map(({ id }) => id.replace(DECK_SUFFIX, ''))).size !== 1
    ) {
      continue;
    }

    merged.set(mergedId, {
      id: mergedId,
      airlineIata: group[0].airlineIata,
      aircraftIata: group[0].aircraftIata,
      variant: baseVariant(group[0].variant as string),
      sourceSlugs: group.map(({ id }) => id).sort(),
    });
  }

  const mergedSources = new Set(
    [...merged.values()].flatMap(({ sourceSlugs }) => sourceSlugs),
  );

  return [
    ...layouts
      .filter((layout) => !mergedSources.has(layout.id))
      .map(asOwnLayout),
    ...merged.values(),
  ];
}
