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
  AR: 'es',
  AT: 'de',
  AU: 'en_AU',
  BE: 'nl',
  BR: 'pt_BR',
  CH: 'de',
  CL: 'es',
  CN: 'zh_CN',
  CO: 'es',
  DE: 'de',
  ES: 'es',
  FR: 'fr',
  GB: 'en_GB',
  IE: 'en_GB',
  IN: 'en_IN',
  IT: 'it',
  JP: 'ja',
  MX: 'es',
  NL: 'nl',
  NZ: 'en_AU',
  PL: 'pl',
  PT: 'pt_BR',
  SE: 'sv',
  TR: 'tr',
  US: 'en_US',
  ZA: 'en_ZA',
};

const CONTINENT_LOCALES: Record<Continent, string> = {
  [Continent.Africa]: 'en_ZA',
  [Continent.Antarctica]: 'en_GB',
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

export function fakerFor(locale: string): Faker {
  const cached = fakers.get(locale);

  if (cached) {
    return cached;
  }

  const definition = LOCALES[locale] ?? en;
  const faker = new Faker({ locale: [definition, en, base] });
  fakers.set(locale, faker);

  return faker;
}
