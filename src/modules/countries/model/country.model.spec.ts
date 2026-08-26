import {
  COUNTRIES,
  countryFlag,
  findCountry,
  findCountryByName,
  isKnownCountryCode,
  toCountryRef,
} from './country.model';
import { UnknownCountryCodeError } from './error/country.error';

const USER_ASSIGNED = ['AA', 'ZZ', 'QM', 'QZ', 'XA', 'XZ'];

describe('country catalogue', () => {
  it('resolves a code to its name, flag and continent', () => {
    expect(findCountry('DE')).toEqual({
      code: 'DE',
      name: 'Germany',
      flag: '🇩🇪',
      continent: 'europe',
    });
  });

  it('uses the project wording where it differs from the default', () => {
    expect(findCountry('US')?.name).toBe('United States of America');
  });

  it('normalises letter case and padding', () => {
    expect(findCountry('de')?.code).toBe('DE');
    expect(findCountry(' gb ')?.code).toBe('GB');
    expect(isKnownCountryCode('pl')).toBe(true);
  });

  it('does not recognise a user-assigned code', () => {
    for (const code of USER_ASSIGNED) {
      expect(findCountry(code)).toBeNull();
      expect(isKnownCountryCode(code)).toBe(false);
    }
  });

  it('does not recognise an unassigned code or a country name', () => {
    expect(isKnownCountryCode('QQ')).toBe(false);
    expect(isKnownCountryCode('Germany')).toBe(false);
    expect(isKnownCountryCode('')).toBe(false);
    expect(isKnownCountryCode(undefined)).toBe(false);
  });

  it('recognises Antarctica', () => {
    expect(findCountry('AQ')).toEqual({
      code: 'AQ',
      name: 'Antarctica',
      flag: '🇦🇶',
      continent: 'antarctica',
    });
  });

  it('holds every assigned code and nothing else', () => {
    expect(COUNTRIES).toHaveLength(249);
  });

  it('holds no duplicate code and no duplicate name', () => {
    const codes = COUNTRIES.map((country) => country.code);
    const names = COUNTRIES.map((country) => country.name);

    expect(new Set(codes).size).toBe(codes.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('holds only well-formed entries', () => {
    for (const country of COUNTRIES) {
      expect(country.code).toMatch(/^[A-Z]{2}$/);
      expect(country.name.length).toBeGreaterThan(0);
      expect(country.flag).toHaveLength(4);
    }
  });

  it('derives a flag from the code', () => {
    expect(countryFlag('DE')).toBe('🇩🇪');
    expect(countryFlag('PL')).toBe('🇵🇱');
  });
});

describe('findCountryByName', () => {
  it('round-trips every catalogue name back to its code', () => {
    for (const country of COUNTRIES) {
      expect(findCountryByName(country.name)?.code).toBe(country.code);
    }
  });

  it('resolves the names the database already holds', () => {
    const stored: Record<string, string> = {
      Germany: 'DE',
      Poland: 'PL',
      France: 'FR',
      Canada: 'CA',
      Iceland: 'IS',
      'United Kingdom': 'GB',
      'United States of America': 'US',
    };

    for (const [name, code] of Object.entries(stored)) {
      expect(findCountryByName(name)?.code).toBe(code);
    }
  });

  it('resolves a name a country has since been renamed from', () => {
    expect(findCountryByName('Turkey')?.code).toBe('TR');
    expect(findCountryByName('Czech Republic')?.code).toBe('CZ');
    expect(findCountryByName('Swaziland')?.code).toBe('SZ');
  });

  it('ignores case and padding', () => {
    expect(findCountryByName('  germany ')?.code).toBe('DE');
  });

  it('returns null for something that is not a country', () => {
    expect(findCountryByName('Atlantis')).toBeNull();
  });
});

describe('toCountryRef', () => {
  it('returns the code and name', () => {
    expect(toCountryRef('DE')).toEqual({ code: 'DE', name: 'Germany' });
  });

  it('normalises the code it was given', () => {
    expect(toCountryRef('de')).toEqual({ code: 'DE', name: 'Germany' });
  });

  it('refuses a code the catalogue does not know', () => {
    expect(() => toCountryRef('QQ')).toThrow(UnknownCountryCodeError);
  });
});
