import { Commodity, SpecialHandlingCode } from './commodity.model';
import { OfferedCommodity } from './commodity-selection';

export function isCargoAircraft(passengers: number): boolean {
  return passengers === 0;
}

export function isCargoAircraftOnly(commodity: Commodity): boolean {
  return commodity.shc.includes(SpecialHandlingCode.CargoAircraftOnly);
}

export function mayCarry(commodity: Commodity, passengers: number): boolean {
  return isCargoAircraft(passengers) || !isCargoAircraftOnly(commodity);
}

export function offeredCommoditiesFor(
  offered: OfferedCommodity[],
  passengers: number,
): OfferedCommodity[] {
  if (isCargoAircraft(passengers)) {
    return offered;
  }

  return offered.filter((offer) => !isCargoAircraftOnly(offer.commodity));
}
