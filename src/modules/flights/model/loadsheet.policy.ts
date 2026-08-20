import { Loadsheet } from './loadsheet.model';
import {
  InconsistentFuelBlockError,
  InconsistentPassengerBreakdownError,
  InvalidPassengerBreakdownError,
} from './error/flight.error';

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

export function assertPassengerBreakdownConsistent(loadsheet: Loadsheet): void {
  const breakdown = loadsheet.passengersByCabin;

  if (!breakdown) {
    return;
  }

  const counts = Object.values(breakdown);

  if (counts.some((count) => !Number.isInteger(count) || count < 0)) {
    throw new InvalidPassengerBreakdownError();
  }

  const seated = counts.reduce((sum, count) => sum + count, 0);

  if (seated !== loadsheet.passengers) {
    throw new InconsistentPassengerBreakdownError();
  }
}
