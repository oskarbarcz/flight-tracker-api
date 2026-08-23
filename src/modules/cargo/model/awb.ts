const SERIAL_LENGTH = 7;
const SERIAL_CEILING = 10 ** SERIAL_LENGTH;
const CHECK_MODULUS = 7;

export const AWB_PREFIXES: Record<string, string> = {
  AA: '001',
  AF: '057',
  BA: '075',
  CV: '172',
  FI: '108',
  KL: '074',
  LH: '020',
  LO: '080',
};

export const AWB_PATTERN = /^\d{3}-\d{8}$/;

export function checkDigitOf(serial: string): number {
  return Number(serial) % CHECK_MODULUS;
}

export function awbPrefixFor(iataCode: string): string {
  const published = AWB_PREFIXES[iataCode];

  if (published) {
    return published;
  }

  const seed = [...iataCode].reduce(
    (sum, character) => sum * 31 + character.charCodeAt(0),
    7,
  );
  const known = new Set(Object.values(AWB_PREFIXES));

  for (let attempt = 0; attempt < 900; attempt++) {
    const candidate = String(((seed + attempt) % 900) + 100);

    if (!known.has(candidate)) {
      return candidate;
    }
  }

  return '999';
}

export function formatAwb(prefix: string, serial: string): string {
  return `${prefix}-${serial}${checkDigitOf(serial)}`;
}

export function generateAwb(prefix: string, roll: number): string {
  const serial = String(Math.floor(roll * SERIAL_CEILING)).padStart(
    SERIAL_LENGTH,
    '0',
  );

  return formatAwb(prefix, serial);
}

export function prefixOf(awb: string): string {
  return awb.slice(0, 3);
}

export function serialOf(awb: string): string {
  return awb.slice(4, 4 + SERIAL_LENGTH);
}

export function isWellFormedAwb(awb: string): boolean {
  if (!AWB_PATTERN.test(awb)) {
    return false;
  }

  const stated = Number(awb.slice(-1));

  return checkDigitOf(serialOf(awb)) === stated;
}
