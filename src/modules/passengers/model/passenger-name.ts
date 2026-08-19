import {
  Faker,
  LocaleDefinition,
  base,
  de,
  en,
  en_AU,
  en_GB,
  en_IN,
  en_US,
  en_ZA,
  es,
  fr,
  it,
  ja,
  nl,
  pl,
  pt_BR,
  sv,
  tr,
  zh_CN,
} from '@faker-js/faker';
import { Continent } from '../../airports/model/airport.model';

const LOCALES: Record<string, LocaleDefinition> = {
  de,
  en,
  en_AU,
  en_GB,
  en_IN,
  en_US,
  en_ZA,
  es,
  fr,
  it,
  ja,
  nl,
  pl,
  pt_BR,
  sv,
  tr,
  zh_CN,
};

const COUNTRY_LOCALES: Record<string, string> = {
  Argentina: 'es',
  Australia: 'en_AU',
  Austria: 'de',
  Belgium: 'nl',
  Brazil: 'pt_BR',
  Chile: 'es',
  China: 'zh_CN',
  Colombia: 'es',
  France: 'fr',
  Germany: 'de',
  India: 'en_IN',
  Ireland: 'en_GB',
  Italy: 'it',
  Japan: 'ja',
  Mexico: 'es',
  Netherlands: 'nl',
  'New Zealand': 'en_AU',
  Poland: 'pl',
  Portugal: 'pt_BR',
  Spain: 'es',
  Sweden: 'sv',
  Switzerland: 'de',
  'South Africa': 'en_ZA',
  Turkey: 'tr',
  'United Kingdom': 'en_GB',
  'United States of America': 'en_US',
};

const CONTINENT_LOCALES: Record<Continent, string> = {
  [Continent.Africa]: 'en_ZA',
  [Continent.Asia]: 'en_IN',
  [Continent.Europe]: 'en_GB',
  [Continent.NorthAmerica]: 'en_US',
  [Continent.Oceania]: 'en_AU',
  [Continent.SouthAmerica]: 'es',
};

const fakers = new Map<string, Faker>();

export function resolvePassengerLocale(
  hubCountry: string | null,
  continent: Continent,
): string {
  const fromCountry = hubCountry ? COUNTRY_LOCALES[hubCountry] : undefined;

  return fromCountry ?? CONTINENT_LOCALES[continent] ?? 'en';
}

export function passengerNameFactory(locale: string): () => string {
  const faker = fakerFor(locale);

  return () => faker.person.fullName();
}

function fakerFor(locale: string): Faker {
  const cached = fakers.get(locale);

  if (cached) {
    return cached;
  }

  const definition = LOCALES[locale] ?? en;
  const faker = new Faker({ locale: [definition, en, base] });
  fakers.set(locale, faker);

  return faker;
}
