import {
  AWB_PREFIXES,
  awbPrefixFor,
  checkDigitOf,
  formatAwb,
  generateAwb,
  isWellFormedAwb,
  prefixOf,
  serialOf,
} from './awb';

describe('air waybill numbers', () => {
  it('takes the check digit as the serial modulo seven', () => {
    expect(checkDigitOf('5372907')).toBe(1);
    expect(checkDigitOf('0000007')).toBe(0);
    expect(checkDigitOf('0000006')).toBe(6);
  });

  it('formats a number as prefix, serial and check digit', () => {
    expect(formatAwb('999', '5372907')).toBe('999-53729071');
    expect(formatAwb('020', '0000007')).toBe('020-00000070');
  });

  it('generates a well formed number from a roll', () => {
    const awb = generateAwb('020', 0.5372907);

    expect(awb).toBe('020-53729071');
    expect(isWellFormedAwb(awb)).toBe(true);
  });

  it('generates a well formed number for every roll', () => {
    const rolls = Array.from({ length: 500 }, (_, index) => index / 500);
    const malformed = rolls
      .map((roll) => generateAwb('074', roll))
      .filter((awb) => !isWellFormedAwb(awb));

    expect(malformed).toEqual([]);
  });

  it('reads back the prefix and the serial', () => {
    expect(prefixOf('020-53729071')).toBe('020');
    expect(serialOf('020-53729071')).toBe('5372907');
  });

  it('refuses a number whose check digit does not match', () => {
    expect(isWellFormedAwb('020-53729072')).toBe(false);
  });

  it('refuses a number of the wrong shape', () => {
    expect(isWellFormedAwb('020-5372907')).toBe(false);
    expect(isWellFormedAwb('20-53729071')).toBe(false);
    expect(isWellFormedAwb('020 53729071')).toBe(false);
    expect(isWellFormedAwb('')).toBe(false);
  });

  it('uses the published prefix of a carrier that has one', () => {
    expect(awbPrefixFor('LH')).toBe('020');
    expect(awbPrefixFor('AF')).toBe('057');
    expect(awbPrefixFor('KL')).toBe('074');
    expect(awbPrefixFor('AA')).toBe('001');
    expect(awbPrefixFor('BA')).toBe('075');
    expect(awbPrefixFor('CV')).toBe('172');
    expect(awbPrefixFor('LO')).toBe('080');
    expect(awbPrefixFor('FI')).toBe('108');
  });

  it('derives a stable prefix for a carrier with no published one', () => {
    const first = awbPrefixFor('DE');

    expect(first).toMatch(/^\d{3}$/);
    expect(awbPrefixFor('DE')).toBe(first);
  });

  it('never derives a prefix that collides with a published one', () => {
    const published = new Set(Object.values(AWB_PREFIXES));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const collisions: string[] = [];

    for (const first of letters) {
      for (const second of letters) {
        const code = `${first}${second}`;

        if (AWB_PREFIXES[code]) {
          continue;
        }

        if (published.has(awbPrefixFor(code))) {
          collisions.push(code);
        }
      }
    }

    expect(collisions).toEqual([]);
  });
});
