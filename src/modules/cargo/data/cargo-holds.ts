import { AircraftHoldLayout, HoldVariant } from '../model/hold-layout.model';
import {
  expandCompartment,
  SourceHoldLayout,
  SourceVariant,
} from '../model/hold-position-expander';
import holdLayoutData from './cargo-holds.json';

export const HOLD_LAYOUT_SOURCE = holdLayoutData as SourceHoldLayout[];

function expandVariant(variant: SourceVariant): HoldVariant {
  return {
    id: variant.id,
    isDefault: variant.isDefault,
    decks: variant.decks.map((deck) => ({
      deck: deck.deck,
      compartments: deck.compartments.map(expandCompartment),
    })),
  };
}

export const AIRCRAFT_HOLD_LAYOUTS: readonly AircraftHoldLayout[] =
  HOLD_LAYOUT_SOURCE.map((layout) => ({
    type: layout.type,
    variants: layout.variants.map(expandVariant),
  }));

export function findHoldLayoutByType(
  type: string,
): AircraftHoldLayout | undefined {
  return AIRCRAFT_HOLD_LAYOUTS.find((layout) => layout.type === type);
}
