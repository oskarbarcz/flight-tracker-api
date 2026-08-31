import { shortAirportName } from './short-name';

describe('shortAirportName', () => {
  it('shortens an international airport to Intl', () => {
    expect(shortAirportName('Frankfurt am Main International Airport')).toBe(
      'Frankfurt am Main Intl',
    );
  });

  it('strips a trailing Airport', () => {
    expect(shortAirportName('London Heathrow Airport')).toBe('London Heathrow');
  });

  it('prefers Intl over stripping, so the word International is not left dangling', () => {
    expect(shortAirportName('Bremen International Airport')).toBe(
      'Bremen Intl',
    );
  });

  it('leaves a name that ends in neither alone', () => {
    expect(shortAirportName('Berlin Brandenburg')).toBe('Berlin Brandenburg');
  });

  it('leaves Airport alone where it is not the last word', () => {
    expect(shortAirportName('Airport City Regional Field')).toBe(
      'Airport City Regional Field',
    );
  });

  it('does not strip a word merely ending in Airport', () => {
    expect(shortAirportName('Southport')).toBe('Southport');
  });

  it('trims the name it is given', () => {
    expect(shortAirportName('  Bremen Airport  ')).toBe('Bremen');
  });
});
