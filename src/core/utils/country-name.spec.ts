import { toCountryName } from './country-name';

describe('toCountryName', () => {
  it('resolves a two-letter code to its country name', () => {
    expect(toCountryName('GB')).toBe('United Kingdom');
    expect(toCountryName('DE')).toBe('Germany');
    expect(toCountryName('PL')).toBe('Poland');
    expect(toCountryName('FR')).toBe('France');
    expect(toCountryName('CA')).toBe('Canada');
    expect(toCountryName('IS')).toBe('Iceland');
  });

  it('uses the project wording where it differs from the default', () => {
    expect(toCountryName('US')).toBe('United States of America');
  });

  it('accepts lowercase and padded codes', () => {
    expect(toCountryName('de')).toBe('Germany');
    expect(toCountryName(' gb ')).toBe('United Kingdom');
  });

  it('returns the input unchanged when it is not a resolvable code', () => {
    expect(toCountryName('QQ')).toBe('QQ');
    expect(toCountryName('')).toBe('');
  });

  it('never resolves a user-assigned code to an ICU placeholder name', () => {
    expect(toCountryName('ZZ')).toBe('ZZ');
    expect(toCountryName('XA')).toBe('XA');
    expect(toCountryName('AA')).toBe('AA');
    expect(toCountryName('QZ')).toBe('QZ');
  });

  it('returns a value that is already a country name unchanged', () => {
    expect(toCountryName('Germany')).toBe('Germany');
    expect(toCountryName('United States of America')).toBe(
      'United States of America',
    );
  });
});
