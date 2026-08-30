import { Loadsheet } from './loadsheet.model';
import {
  InconsistentFuelBlockError,
  InconsistentPassengerBreakdownError,
  PayloadBelowLoadError,
} from './error/flight.error';
import { STANDARD_ADULT_KG } from '../../manifest/model/baggage';

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

export function plannedPassengerMass(loadsheet: Loadsheet): number {
  return loadsheet.passengerMass ?? STANDARD_ADULT_KG;
}

export function withPlannedPassengerMass(
  loadsheet: Loadsheet,
  mass: number | null | undefined,
): Loadsheet {
  const planned: Loadsheet = { ...loadsheet };

  if (mass === null || mass === undefined) {
    delete planned.passengerMass;
  } else {
    planned.passengerMass = mass;
  }

  return planned;
}

export function assertPayloadAccountsForLoad(loadsheet: Loadsheet): void {
  const payloadKg = Math.round(loadsheet.payload * 1000);
  const requiredKg = Math.round(
    loadsheet.cargo * 1000 +
      loadsheet.passengers * plannedPassengerMass(loadsheet),
  );

  if (payloadKg < requiredKg) {
    throw new PayloadBelowLoadError(payloadKg, requiredKg);
  }
}

export function assertPassengerBreakdownConsistent(loadsheet: Loadsheet): void {
  const breakdown = loadsheet.passengersByCabin;

  if (!breakdown) {
    return;
  }

  const seated = Object.values(breakdown).reduce(
    (sum, count) => sum + count,
    0,
  );

  if (seated !== loadsheet.passengers) {
    throw new InconsistentPassengerBreakdownError();
  }
}
