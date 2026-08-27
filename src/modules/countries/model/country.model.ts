import { ApiProperty } from '@nestjs/swagger';
import { Continent } from '../../../../prisma/client/enums';
import countryData from '../data/countries.data.json';
import { UnknownCountryCodeError } from './error/country.error';

const REGIONAL_INDICATOR_BASE = 0x1f1e6;
const LETTER_A = 'A'.charCodeAt(0);

const NAME_ALIASES: Record<string, string> = {
  BURMA: 'MM',
  'CABO VERDE': 'CV',
  'CZECH REPUBLIC': 'CZ',
  'EAST TIMOR': 'TL',
  'HOLY SEE': 'VA',
  'IVORY COAST': 'CI',
  MACEDONIA: 'MK',
  PALESTINE: 'PS',
  SWAZILAND: 'SZ',
  TURKEY: 'TR',
  'UNITED STATES': 'US',
  VATICAN: 'VA',
};

type CountryRecord = {
  code: string;
  name: string;
  continent: string;
};

export class CountryRef {
  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'DE',
  })
  code!: string;

  @ApiProperty({
    description: 'Country name in English',
    example: 'Germany',
  })
  name!: string;
}

export class Country extends CountryRef {
  @ApiProperty({
    description: 'Country flag as a pair of regional indicator symbols',
    example: '🇩🇪',
  })
  flag!: string;

  @ApiProperty({
    enum: Continent,
    example: Continent.europe,
  })
  continent!: Continent;
}

export class GetCountriesResponse {
  @ApiProperty({ type: [Country] })
  countries!: Country[];
}

const CONTINENT_NAMES: Record<Continent, string> = {
  [Continent.africa]: 'Africa',
  [Continent.antarctica]: 'Antarctica',
  [Continent.asia]: 'Asia',
  [Continent.europe]: 'Europe',
  [Continent.north_america]: 'North America',
  [Continent.oceania]: 'Oceania',
  [Continent.south_america]: 'South America',
};

export function continentName(continent: Continent): string {
  return CONTINENT_NAMES[continent];
}

export function normalizeCountryCode(value: string): string {
  return value.trim().toUpperCase();
}

export function countryFlag(code: string): string {
  return String.fromCodePoint(
    ...[...code].map(
      (letter) => REGIONAL_INDICATOR_BASE + letter.charCodeAt(0) - LETTER_A,
    ),
  );
}

function toCountry(record: CountryRecord): Country {
  return {
    code: record.code,
    name: record.name,
    flag: countryFlag(record.code),
    continent: record.continent as Continent,
  };
}

export const COUNTRIES: readonly Country[] = (
  countryData as CountryRecord[]
).map(toCountry);

const BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]));

const BY_NAME = new Map(
  COUNTRIES.map((country) => [country.name.toUpperCase(), country.code]),
);

export function findCountry(code: string): Country | null {
  return BY_CODE.get(normalizeCountryCode(code)) ?? null;
}

export function isKnownCountryCode(code: unknown): boolean {
  return typeof code === 'string' && BY_CODE.has(normalizeCountryCode(code));
}

export function findCountryByName(name: string): Country | null {
  const key = name.trim().toUpperCase();
  const code = BY_NAME.get(key) ?? NAME_ALIASES[key];

  return code ? (BY_CODE.get(code) ?? null) : null;
}

export function findCountryOrThrow(code: string): Country {
  const country = findCountry(code);

  if (!country) {
    throw new UnknownCountryCodeError(code);
  }

  return country;
}

export function toCountryRef(code: string): CountryRef {
  const country = findCountryOrThrow(code);

  return { code: country.code, name: country.name };
}
