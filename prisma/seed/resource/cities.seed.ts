import { Prisma } from '../../client/client';

export const CITY_IDS = {
  frankfurt: 'e8e8d77d-4b22-42cb-b163-13d54eec3597',
  warsaw: 'ec2d2121-804b-4f8f-a9d7-991ebd8465e8',
  newYork: '6ef8953e-7c45-417a-b850-7e3c53de54cd',
  paris: '17c8f21f-b5a3-41f5-a1e3-16f4100c2342',
  gooseBay: '4670768b-9029-4de4-a078-19284031b8c5',
  reykjavik: 'bb33c063-d0c3-4468-98ce-a048a78f409a',
  stJohns: 'e5c4da3c-30af-4a50-be48-832cdb854cd7',
  philadelphia: 'e30d5e72-29ca-4f01-8e75-fdc55e3b296a',
  boston: '19364a7d-3982-43e5-9630-9ce7c3a44e98',
  bremen: '11fe7e0d-ef97-4a1d-9a87-8ad9da64fd91',
} as const;

export async function loadCities(tx: Prisma.TransactionClient): Promise<void> {
  await tx.city.createMany({
    data: [
      { id: CITY_IDS.frankfurt, name: 'Frankfurt', country: 'DE' },
      { id: CITY_IDS.warsaw, name: 'Warsaw', country: 'PL' },
      { id: CITY_IDS.newYork, name: 'New York', country: 'US' },
      { id: CITY_IDS.paris, name: 'Paris', country: 'FR' },
      { id: CITY_IDS.gooseBay, name: 'Goose Bay', country: 'CA' },
      { id: CITY_IDS.reykjavik, name: 'Reykjavik', country: 'IS' },
      { id: CITY_IDS.stJohns, name: 'St. Johns', country: 'CA' },
      { id: CITY_IDS.philadelphia, name: 'Philadelphia', country: 'US' },
      { id: CITY_IDS.boston, name: 'Boston', country: 'US' },
      { id: CITY_IDS.bremen, name: 'Bremen', country: 'DE' },
    ],
  });
}
