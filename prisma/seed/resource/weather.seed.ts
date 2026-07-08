import { Prisma } from '../../client/client';

export async function loadWeather(tx: Prisma.TransactionClient): Promise<void> {
  const weather: Prisma.AirportWeatherCreateManyInput[] = [
    {
      airportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
      metar: 'EPWA 081200Z 20006KT 9999 SCT040 24/13 Q1016 NOSIG',
      metarLastUpdate: new Date('2026-07-08T12:00:00.000Z'),
      taf: 'TAF EPWA 081100Z 0812/0918 20008KT 9999 SCT040 BECMG 0900/0902 24010KT',
      tafLastUpdate: new Date('2026-07-08T11:00:00.000Z'),
      watch: true,
    },
    {
      airportId: 'f35c094a-bec5-4803-be32-bd80a14b441a',
      metar: 'EDDF 081200Z 24008KT 9999 FEW035 22/12 Q1018 NOSIG',
      metarLastUpdate: new Date('2026-07-08T12:00:00.000Z'),
      taf: 'TAF EDDF 081100Z 0812/0918 24010KT 9999 FEW035 BECMG 0815/0817 27012KT',
      tafLastUpdate: new Date('2026-07-08T11:00:00.000Z'),
      watch: false,
    },
  ];

  await tx.airportWeather.createMany({ data: weather });
}
