import {
  isCargoAircraft,
  isCargoAircraftOnly,
  mayCarry,
  offeredCommoditiesFor,
} from './cargo-aircraft-only.policy';
import { findCommodityById, COMMODITIES } from '../data/cargo-commodities';
import { SpecialHandlingCode } from './commodity.model';
import { SourceTier } from './commodity-selection';

const lithium = findCommodityById('lithium-ion-standalone')!;
const roses = findCommodityById('flowers-roses')!;

const offered = COMMODITIES.map((commodity) => ({
  commodity,
  tier: SourceTier.Generic,
  weight: 1,
}));

describe('cargo aircraft only policy', () => {
  it('reads an aircraft carrying nobody as a cargo aircraft', () => {
    expect(isCargoAircraft(0)).toBe(true);
    expect(isCargoAircraft(1)).toBe(false);
    expect(isCargoAircraft(200)).toBe(false);
  });

  it('recognises a commodity restricted to cargo aircraft', () => {
    expect(isCargoAircraftOnly(lithium)).toBe(true);
    expect(lithium.shc).toContain(SpecialHandlingCode.CargoAircraftOnly);
    expect(isCargoAircraftOnly(roses)).toBe(false);
  });

  it('forbids restricted load on a flight carrying passengers', () => {
    expect(mayCarry(lithium, 200)).toBe(false);
    expect(mayCarry(lithium, 1)).toBe(false);
  });

  it('permits restricted load on a freighter', () => {
    expect(mayCarry(lithium, 0)).toBe(true);
  });

  it('permits restricted load on a passenger aircraft carrying nobody', () => {
    expect(mayCarry(lithium, 0)).toBe(true);
  });

  it('never restricts ordinary load', () => {
    expect(mayCarry(roses, 200)).toBe(true);
    expect(mayCarry(roses, 0)).toBe(true);
  });

  it('withholds every restricted commodity from a flight carrying passengers', () => {
    const allowed = offeredCommoditiesFor(offered, 150);
    const restricted = allowed.filter((offer) =>
      isCargoAircraftOnly(offer.commodity),
    );

    expect(restricted).toEqual([]);
    expect(allowed.length).toBeLessThan(offered.length);
  });

  it('withholds nothing from a flight carrying nobody', () => {
    const allowed = offeredCommoditiesFor(offered, 0);

    expect(allowed).toHaveLength(offered.length);
    expect(allowed.some((offer) => isCargoAircraftOnly(offer.commodity))).toBe(
      true,
    );
  });
});
