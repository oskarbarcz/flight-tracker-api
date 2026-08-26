import { passengerNameFactory, resolvePassengerLocale } from './passenger-name';
import { Continent } from '../../airports/model/airport.model';

describe('passenger locale resolution', () => {
  it("follows the country of the operator's hub", () => {
    expect(resolvePassengerLocale('DE', Continent.Europe)).toBe('de');
    expect(resolvePassengerLocale('PL', Continent.Europe)).toBe('pl');
    expect(resolvePassengerLocale('US', Continent.NorthAmerica)).toBe('en_US');
  });

  it('falls back to the continent when the country has no locale', () => {
    expect(resolvePassengerLocale('IS', Continent.Europe)).toBe('en_GB');
    expect(resolvePassengerLocale('KE', Continent.Africa)).toBe('en_ZA');
  });

  it('falls back to the continent when the hub is unknown', () => {
    expect(resolvePassengerLocale(null, Continent.SouthAmerica)).toBe('es');
    expect(resolvePassengerLocale(null, Continent.Oceania)).toBe('en_AU');
    expect(resolvePassengerLocale(null, Continent.Asia)).toBe('en_IN');
  });

  it('prefers the hub country over the continent', () => {
    expect(resolvePassengerLocale('JP', Continent.NorthAmerica)).toBe('ja');
  });
});

describe('passenger names', () => {
  it('generates a name for a resolved locale', () => {
    const name = passengerNameFactory('de')();

    expect(name.length).toBeGreaterThan(2);
    expect(name.trim()).toBe(name);
  });

  it('generates different names for different passengers', () => {
    const nextName = passengerNameFactory('en_US');
    const names = new Set(Array.from({ length: 50 }, () => nextName()));

    expect(names.size).toBeGreaterThan(40);
  });

  it('generates a name even for a locale it does not carry', () => {
    expect(passengerNameFactory('is')().length).toBeGreaterThan(2);
  });
});
