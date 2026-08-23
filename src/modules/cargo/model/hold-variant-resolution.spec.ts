import {
  assertHoldVariantOffered,
  resolveHoldVariant,
} from './hold-variant-resolution';
import {
  HoldLayoutNotFoundError,
  HoldVariantNotFoundError,
} from './error/cargo.error';
import { positionsOf } from './hold-layout.model';

describe('hold variant resolution', () => {
  it('resolves an assigned variant the type offers', () => {
    expect(resolveHoldVariant('A320', 'a320-cls')?.id).toBe('a320-cls');
  });

  it('falls back to the type default when nothing is assigned', () => {
    expect(resolveHoldVariant('A320', null)?.id).toBe('a320-bulk');
  });

  it('gives a bulk-only type its single variant', () => {
    expect(resolveHoldVariant('B738', null)?.id).toBe('b738-bulk');
  });

  it('resolves nothing for a type carrying no curated hold data', () => {
    expect(resolveHoldVariant('C172', null)).toBeNull();
    expect(resolveHoldVariant('C172', 'anything')).toBeNull();
  });

  it('falls back to the default when the assigned variant is no longer offered', () => {
    expect(resolveHoldVariant('A320', 'a320-withdrawn')?.id).toBe('a320-bulk');
  });

  it('leaves an unassigned narrowbody without container positions', () => {
    expect(positionsOf(resolveHoldVariant('A320', null)!)).toEqual([]);
  });

  it('gives an assigned narrowbody its container positions', () => {
    expect(positionsOf(resolveHoldVariant('A320', 'a320-cls')!)).toHaveLength(
      7,
    );
  });

  it('accepts a variant the type offers', () => {
    expect(() => assertHoldVariantOffered('A320', 'a320-cls')).not.toThrow();
  });

  it('refuses a variant the type does not offer', () => {
    expect(() => assertHoldVariantOffered('A320', 'b77w-ld3')).toThrow(
      HoldVariantNotFoundError,
    );
  });

  it('refuses any variant for a type carrying no curated hold data', () => {
    expect(() => assertHoldVariantOffered('C172', 'a320-cls')).toThrow(
      HoldLayoutNotFoundError,
    );
  });
});
