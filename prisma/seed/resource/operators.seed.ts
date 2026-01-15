import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';
import { Operator } from '../../client/client';

export async function loadOperators(): Promise<void> {
  const condor: Operator = {
    id: '5c649579-22eb-4c07-a96c-b74a77f53871',
    icaoCode: 'CDG',
    shortName: 'Condor',
    fullName: 'Condor Flugdienst',
    callsign: 'CONDOR',
  };

  const lufthansa: Operator = {
    id: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d',
    icaoCode: 'DLH',
    shortName: 'Lufthansa',
    fullName: 'Deutsche Lufthansa AG',
    callsign: 'LUFTHANSA',
  };

  const lot: Operator = {
    id: '1d85d597-c3a1-43cf-b888-10d674ea7a46',
    icaoCode: 'LOT',
    shortName: 'LOT',
    fullName: 'Polskie Linie Lotnicze LOT',
    callsign: 'LOT',
  };

  const american: Operator = {
    id: '1f630d38-ad24-47cc-950b-3783e71bbd10',
    icaoCode: 'AAL',
    shortName: 'American Airlines',
    fullName: 'American Airlines, Inc.',
    callsign: 'AMERICAN',
  };

  const british: Operator = {
    id: '5c00f71c-287c-4bca-a738-caf7e2669c65',
    icaoCode: 'BAW',
    shortName: 'British Airways',
    fullName: 'British Airways plc',
    callsign: 'SPEEDBIRD',
  };

  const prisma = new PrismaService();
  for (const operator of [condor, lufthansa, lot, american, british]) {
    await prisma.operator.create({ data: operator });
  }
}
