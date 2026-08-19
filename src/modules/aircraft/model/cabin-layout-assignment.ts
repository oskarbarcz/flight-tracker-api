import { AircraftCabinLayout } from './cabin-layout.model';

export type AssignedLayout = {
  id: string;
  airlineIata: string;
  aircraftIata: string;
  variant: string | null;
  retiredAt: Date | null;
  versions: { revision: number }[];
};

export function toAircraftCabinLayout(
  layout: AssignedLayout | null,
  operatorIataCode: string | null,
  airframeIataType: string | null,
): AircraftCabinLayout | null {
  if (!layout) {
    return null;
  }

  return {
    id: layout.id,
    airlineIata: layout.airlineIata,
    aircraftIata: layout.aircraftIata,
    variant: layout.variant,
    revision: layout.versions[0]?.revision ?? null,
    retired: layout.retiredAt !== null,
    mismatched:
      layout.airlineIata !== operatorIataCode ||
      layout.aircraftIata !== airframeIataType,
  };
}
