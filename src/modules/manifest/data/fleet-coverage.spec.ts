import * as fs from 'node:fs';
import * as path from 'node:path';
import { findHoldLayoutByType } from './cargo-holds';

const SEEDS = ['aircrafts.seed.ts', 'cargo-flights.seed.ts'];
const DEGRADED_PATH_FIXTURE_TYPES = ['B762'];
const DESIGNATOR = /^\s+type: '([A-Z0-9]{3,4})',$/gm;

function fleetTypes(): string[] {
  const found = SEEDS.flatMap((file) => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'prisma', 'seed', 'resource', file),
      'utf8',
    );

    return [...source.matchAll(DESIGNATOR)].map((match) => match[1]);
  });

  return [...new Set(found)].sort();
}

describe('curated hold data against the operated fleet', () => {
  it('finds the fleet, so a silent parse failure cannot make this vacuous', () => {
    expect(fleetTypes().length).toBeGreaterThan(5);
  });

  it('covers every airframe type an aircraft is recorded as', () => {
    const uncovered = fleetTypes()
      .filter((type) => !DEGRADED_PATH_FIXTURE_TYPES.includes(type))
      .filter((type) => findHoldLayoutByType(type) === undefined);

    expect(uncovered).toEqual([]);
  });

  it('keeps the degraded-path fixture uncurated, or it stops proving anything', () => {
    const curated = DEGRADED_PATH_FIXTURE_TYPES.filter(
      (type) => findHoldLayoutByType(type) !== undefined,
    );

    expect(curated).toEqual([]);
  });

  it('gives every fleet type a default variant to fall back to', () => {
    const withoutDefault = fleetTypes()
      .filter((type) => !DEGRADED_PATH_FIXTURE_TYPES.includes(type))
      .filter((type) => {
        const layout = findHoldLayoutByType(type);

        return !layout?.variants.some((variant) => variant.isDefault);
      });

    expect(withoutDefault).toEqual([]);
  });
});
