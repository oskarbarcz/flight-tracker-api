import { Aircraft, PrismaClient } from '@prisma/client';

export async function loadAircraft(prisma: PrismaClient): Promise<void> {
  const a330: Aircraft = {
    id: '9f5da1a4-f09e-4961-8299-82d688337d1f',
    icaoCode: 'A339',
    shortName: 'Airbus A330',
    fullName: 'Airbus A330-900 neo',
    registration: 'D-AIMC',
    selcal: 'LR-CK',
    livery: 'Fanhansa (2024)',
    operatorId: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d', // Lufthansa
  };

  const a321: Aircraft = {
    id: '7d27a031-5abb-415f-bde5-1aa563ad394e',
    icaoCode: 'A321',
    shortName: 'A321-251',
    fullName: 'Airbus A331-251 SL ACT-2',
    registration: 'D-AIDA',
    selcal: 'SK-PK',
    livery: 'Sunshine (2024)',
    operatorId: '5c649579-22eb-4c07-a96c-b74a77f53871', // Condor
  };

  const a319: Aircraft = {
    id: '3f34bc59-c9c3-4ad0-88fa-2cc570298602',
    icaoCode: 'A319',
    shortName: 'A319-200',
    fullName: 'Airbus A319-200(neo)',
    registration: 'D-AIDK',
    selcal: 'MS-KL',
    livery: 'Water (2024)',
    operatorId: '5c649579-22eb-4c07-a96c-b74a77f53871', // Condor
  };

  const b773: Aircraft = {
    id: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98',
    icaoCode: 'B773',
    shortName: 'B777-300ER',
    fullName: 'Boeing 777-300ER',
    registration: 'N78881',
    selcal: 'KY-JO',
    livery: 'Team USA (2023)',
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
  };

  for (const aircraft of [a330, a321, a319, b773]) {
    await prisma.aircraft.create({ data: aircraft });
  }
}
