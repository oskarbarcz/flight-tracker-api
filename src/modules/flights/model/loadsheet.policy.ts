import { Loadsheet } from './loadsheet.model';
import { InconsistentFuelBlockError } from './error/flight.error';

function roundToTons(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function assertFuelBreakdownConsistent(loadsheet: Loadsheet): void {
  if (!loadsheet.fuel) {
    return;
  }

  if (roundToTons(loadsheet.fuel.block) !== roundToTons(loadsheet.blockFuel)) {
    throw new InconsistentFuelBlockError();
  }
}
