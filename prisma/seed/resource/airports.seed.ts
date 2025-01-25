import { Airport, PrismaClient } from '@prisma/client';

export async function loadAirports(prisma: PrismaClient): Promise<void> {
  const frankfurt: Airport = {
    id: 'f35c094a-bec5-4803-be32-bd80a14b441a',
    icaoCode: 'EDDF',
    iataCode: 'FRA',
    city: 'Frankfurt',
    name: 'Frankfurt Rhein/Main',
    country: 'Germany',
    timezone: 'Europe/Berlin',
  };

  const warsaw: Airport = {
    id: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
    icaoCode: 'EPWA',
    iataCode: 'WAW',
    city: 'Warsaw',
    name: 'Warsaw Chopin',
    country: 'Poland',
    timezone: 'Europe/Warsaw',
  };

  const newYork: Airport = {
    id: '3c721cc6-c653-4fad-be43-dc9d6a149383',
    icaoCode: 'KJFK',
    iataCode: 'JFK',
    city: 'New York',
    name: 'New York JFK',
    country: 'United States of America',
    timezone: 'America/New_York',
  };

  const paris: Airport = {
    id: '79b8f884-f67d-4585-b540-36b0be7f551e',
    icaoCode: 'LFPG',
    iataCode: 'CDG',
    city: 'Paris',
    name: 'Paris Charles de Gaulle',
    country: 'France',
    timezone: 'Europe/Paris',
  };

  const gooseBay: Airport = {
    id: 'fa8ee2e9-fb94-4416-9ed0-4811efd488ae',
    icaoCode: 'CYYR',
    iataCode: 'YYR',
    city: 'Goose Bay',
    name: 'Goose Bay Intl',
    country: 'Canada',
    timezone: 'America/Goose_Bay',
  };

  const reykjavik: Airport = {
    id: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a',
    icaoCode: 'BIRK',
    iataCode: 'KEF',
    city: 'Reykjavik',
    name: 'Reykjavik Keflavik',
    country: 'Iceland',
    timezone: 'Atlantic/Reykjavik',
  };

  const stJohns: Airport = {
    id: '6cf1fcd8-d072-46b5-8132-bd885b43dd97',
    icaoCode: 'CYYT',
    iataCode: 'YYT',
    city: 'St. Johns',
    name: 'St. Johns Intl',
    country: 'Canada',
    timezone: 'America/St_Johns',
  };

  const philadelphia: Airport = {
    id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
    icaoCode: 'KPHL',
    iataCode: 'PHL',
    city: 'Philadelphia',
    name: 'Philadelphia Intl',
    country: 'United States of America',
    timezone: 'America/New_York',
  };

  const boston: Airport = {
    id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
    icaoCode: 'KBOS',
    iataCode: 'BOS',
    city: 'Boston',
    name: 'Boston Logan Intl',
    country: 'United States of America',
    timezone: 'America/New_York',
  };

  const bremen: Airport = {
    id: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf',
    icaoCode: 'EDDW',
    iataCode: 'BRE',
    city: 'Bremen',
    name: 'Bremen',
    country: 'Germany',
    timezone: 'Europe/Berlin',
  };

  for (const airport of [
    frankfurt,
    warsaw,
    newYork,
    paris,
    gooseBay,
    reykjavik,
    stJohns,
    philadelphia,
    boston,
    bremen,
  ]) {
    await prisma.airport.create({ data: airport });
  }
}
