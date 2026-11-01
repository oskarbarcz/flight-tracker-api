import {
  formatUserCode,
  generateDeviceCode,
  generateUserCode,
  hashDeviceCode,
  normalizeUserCode,
} from './device-authorization.model';

describe('device authorization codes', () => {
  it('draws user codes of eight consonants', () => {
    const codes = Array.from({ length: 200 }, () => generateUserCode());

    for (const code of codes) {
      expect(code).toMatch(/^[BCDFGHJKLMNPQRSTVWXZ]{8}$/);
    }
    expect(new Set(codes).size).toBeGreaterThan(195);
  });

  it('shows a user code in two halves', () => {
    expect(formatUserCode('SFCDNLVQ')).toBe('SFCD-NLVQ');
  });

  it.each([
    ['SFCD-NLVQ', 'SFCDNLVQ'],
    ['sfcd-nlvq', 'SFCDNLVQ'],
    ['sfcdnlvq', 'SFCDNLVQ'],
    [' SFCD NLVQ ', 'SFCDNLVQ'],
  ])('reads %p as the stored code', (typed, stored) => {
    expect(normalizeUserCode(typed)).toBe(stored);
  });

  it('draws device codes of 256 random bits', () => {
    const code = generateDeviceCode();

    expect(code).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generateDeviceCode()).not.toBe(code);
  });

  it('stores a device code only as its SHA-256 hash', () => {
    expect(hashDeviceCode('5Ltk0oBiQBtbdikMEOU0wj6cLnVpI3fP4KjzVXPPvr0')).toBe(
      'f2467a0e4b844b53cdf91c097aad655637f0cea2e2dd376bc44118836288b412',
    );
  });
});
