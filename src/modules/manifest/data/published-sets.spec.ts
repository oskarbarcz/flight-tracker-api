import { COMMODITIES, COMMODITY_IDS } from './cargo-commodities';
import { AIRCRAFT_HOLD_LAYOUTS } from './cargo-holds';
import { CURATED_HOLD_TYPES, HOLD_VARIANT_IDS } from './hold-identifiers';
import { SpecialHandlingCode } from '../model/commodity.model';

describe('COMMODITY_IDS', () => {
  it('carries every catalogue entry, once', () => {
    expect(COMMODITY_IDS).toHaveLength(COMMODITIES.length);
    expect(new Set(COMMODITY_IDS).size).toBe(COMMODITIES.length);
  });

  it('matches the catalogue exactly, in its order', () => {
    expect(COMMODITY_IDS).toEqual(COMMODITIES.map((commodity) => commodity.id));
  });

  it('is not empty, so the published set never degrades to nothing', () => {
    expect(COMMODITY_IDS.length).toBeGreaterThan(0);
  });
});

describe('HOLD_VARIANT_IDS', () => {
  it('carries every variant of every curated type, once', () => {
    const declared = AIRCRAFT_HOLD_LAYOUTS.flatMap((layout) =>
      layout.variants.map((variant) => variant.id),
    );

    expect(HOLD_VARIANT_IDS).toEqual(declared);
    expect(new Set(HOLD_VARIANT_IDS).size).toBe(declared.length);
  });
});

describe('CURATED_HOLD_TYPES', () => {
  it('names every curated airframe type, once', () => {
    const declared = AIRCRAFT_HOLD_LAYOUTS.map((layout) => layout.type);

    expect(CURATED_HOLD_TYPES).toEqual(declared);
    expect(new Set(CURATED_HOLD_TYPES).size).toBe(declared.length);
  });
});

describe('the special handling vocabulary', () => {
  it('is the set every shipment code is drawn from', () => {
    const vocabulary = new Set<string>(Object.values(SpecialHandlingCode));
    const unknown = COMMODITIES.flatMap((commodity) => commodity.shc).filter(
      (code) => !vocabulary.has(code),
    );

    expect(unknown).toEqual([]);
  });
});
