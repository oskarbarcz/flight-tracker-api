const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
  US: 'United States of America',
};

const regionNames = new Intl.DisplayNames(['en'], {
  type: 'region',
  fallback: 'none',
});

function isUserAssignedCode(code: string): boolean {
  const [first, second] = code;

  return (
    code === 'AA' ||
    code === 'ZZ' ||
    first === 'X' ||
    (first === 'Q' && second >= 'M' && second <= 'Z')
  );
}

export function toCountryName(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();

  if (code.length !== 2 || isUserAssignedCode(code)) {
    return countryCode;
  }

  const override = COUNTRY_NAME_OVERRIDES[code];
  if (override) {
    return override;
  }

  try {
    return regionNames.of(code) ?? countryCode;
  } catch {
    return countryCode;
  }
}
