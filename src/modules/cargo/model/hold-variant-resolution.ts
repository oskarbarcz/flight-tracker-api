import {
  AircraftHoldLayout,
  defaultVariantOf,
  findVariant,
  HoldVariant,
} from './hold-layout.model';
import { findHoldLayoutByType } from '../data/cargo-holds';
import {
  HoldLayoutNotFoundError,
  HoldVariantNotFoundError,
} from './error/cargo.error';

export function resolveHoldVariant(
  airframeType: string,
  assignedVariant: string | null,
): HoldVariant | null {
  const layout = findHoldLayoutByType(airframeType);

  if (!layout) {
    return null;
  }

  if (!assignedVariant) {
    return defaultVariantOf(layout);
  }

  return findVariant(layout, assignedVariant) ?? defaultVariantOf(layout);
}

export function assertHoldVariantOffered(
  airframeType: string,
  variant: string,
): AircraftHoldLayout {
  const layout = findHoldLayoutByType(airframeType);

  if (!layout) {
    throw new HoldLayoutNotFoundError(airframeType);
  }

  if (!findVariant(layout, variant)) {
    throw new HoldVariantNotFoundError(airframeType, variant);
  }

  return layout;
}
