const INTERNATIONAL_AIRPORT_SUFFIX = ' International Airport';
const AIRPORT_SUFFIX = ' Airport';

export function shortAirportName(name: string): string {
  const trimmed = name.trim();

  if (trimmed.endsWith(INTERNATIONAL_AIRPORT_SUFFIX)) {
    return `${trimmed.slice(0, -INTERNATIONAL_AIRPORT_SUFFIX.length)} Intl`;
  }

  if (trimmed.endsWith(AIRPORT_SUFFIX)) {
    return trimmed.slice(0, -AIRPORT_SUFFIX.length);
  }

  return trimmed;
}
