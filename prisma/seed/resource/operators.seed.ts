import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';
import { OperatorType, Prisma } from '../../client/client';
import { Continent } from '../../../src/modules/airports/model/airport.model';

export async function loadOperators(): Promise<void> {
  const condor = {
    id: '5c649579-22eb-4c07-a96c-b74a77f53871',
    icaoCode: 'CDG',
    iataCode: 'DE',
    shortName: 'Condor',
    fullName: 'Condor Flugdienst',
    callsign: 'CONDOR',
    type: OperatorType.low_cost,
    hubs: [
      'BER',
      'DUS',
      'FRA',
      'HAM',
      'MUC',
      'STR',
      'ZRH',
    ] as Prisma.InputJsonValue,
    fleetSize: 2,
    fleetTypes: ['A321', 'A319'] as Prisma.InputJsonValue,
    avgFleetAge: 9.2,
    logoUrl:
      'https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/condor.png',
    backgroundUrl: null,
    continent: Continent.Europe,
  };

  const lufthansa = {
    id: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d',
    icaoCode: 'DLH',
    iataCode: 'LH',
    shortName: 'Lufthansa',
    fullName: 'Deutsche Lufthansa AG',
    callsign: 'LUFTHANSA',
    type: OperatorType.legacy,
    hubs: ['FRA', 'MUC'] as Prisma.InputJsonValue,
    fleetSize: 1,
    fleetTypes: ['A339'] as Prisma.InputJsonValue,
    avgFleetAge: 14.2,
    logoUrl:
      'https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lufthansa.png',
    backgroundUrl: null,
    continent: Continent.Europe,
  };

  const lot = {
    id: '1d85d597-c3a1-43cf-b888-10d674ea7a46',
    icaoCode: 'LOT',
    iataCode: 'LO',
    shortName: 'LOT',
    fullName: 'Polskie Linie Lotnicze LOT',
    callsign: 'LOT',
    type: OperatorType.legacy,
    hubs: ['WAW'] as Prisma.InputJsonValue,
    fleetSize: 0,
    fleetTypes: [] as Prisma.InputJsonValue,
    avgFleetAge: 11.1,
    logoUrl:
      'https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lot_polish.png',
    backgroundUrl: null,
    continent: Continent.Europe,
  };

  const american = {
    id: '1f630d38-ad24-47cc-950b-3783e71bbd10',
    icaoCode: 'AAL',
    iataCode: 'AA',
    shortName: 'American Airlines',
    fullName: 'American Airlines, Inc.',
    callsign: 'AMERICAN',
    type: OperatorType.legacy,
    hubs: [
      'CLT',
      'DFW',
      'JFK',
      'LAX',
      'MIA',
      'ORD',
      'LGA',
      'PHL',
      'PHX',
      'DCA',
    ] as Prisma.InputJsonValue,
    fleetSize: 1,
    fleetTypes: ['B77W'] as Prisma.InputJsonValue,
    avgFleetAge: 14.4,
    logoUrl:
      'https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/american_airlines.png',
    backgroundUrl: null,
    continent: Continent.NorthAmerica,
  };

  const british = {
    id: '5c00f71c-287c-4bca-a738-caf7e2669c65',
    icaoCode: 'BAW',
    iataCode: 'BA',
    shortName: 'British Airways',
    fullName: 'British Airways plc',
    callsign: 'SPEEDBIRD',
    type: OperatorType.legacy,
    hubs: ['LHR'] as Prisma.InputJsonValue,
    fleetSize: 0,
    fleetTypes: [] as Prisma.InputJsonValue,
    avgFleetAge: 13.6,
    logoUrl:
      'https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/british_airways.png',
    backgroundUrl: null,
    continent: Continent.Europe,
  };

  const prisma = new PrismaService();
  for (const operator of [condor, lufthansa, lot, american, british]) {
    await prisma.operator.create({ data: operator });
  }
}
