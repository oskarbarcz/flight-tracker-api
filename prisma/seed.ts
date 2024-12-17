import {
  Aircraft,
  Airport,
  Operator,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { FlightStatus } from "../src/flights/entities/flight.entity";
import { AirportType } from "../src/airports/entities/airport.entity";
const prisma = new PrismaClient();

async function main() {
  await loadAirports();
  await loadOperators();
  await loadAircraft();
  await loadFlights();
}

async function loadAirports(): Promise<void> {
  const frankfurt: Airport = {
    id: 'f35c094a-bec5-4803-be32-bd80a14b441a',
    icaoCode: 'EDDF',
    name: 'Frankfurt Rhein/Main',
    country: 'Germany',
    timezone: 'Europe/Berlin',
  };

  const warsaw: Airport = {
    id: '616cbdd7-ccfc-4687-8cf6-1e7236435046',
    icaoCode: 'EPWA',
    name: 'Warsaw Chopin',
    country: 'Poland',
    timezone: 'Europe/Warsaw',
  };

  const newYork: Airport = {
    id: '3c721cc6-c653-4fad-be43-dc9d6a149383',
    icaoCode: 'KJFK',
    name: 'New York JFK',
    country: 'United States of America',
    timezone: 'America/New_York',
  };

  const paris: Airport = {
    id: '79b8f884-f67d-4585-b540-36b0be7f551e',
    icaoCode: 'LFPG',
    name: 'Paris Charles de Gaulle',
    country: 'France',
    timezone: 'Europe/Paris',
  };

  const gooseBay: Airport = {
    id: 'fa8ee2e9-fb94-4416-9ed0-4811efd488ae',
    icaoCode: 'CYYR',
    name: 'Goose Bay Intl',
    country: 'Canada',
    timezone: 'America/Goose_Bay',
  };

  const reykjavik: Airport = {
    id: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a',
    icaoCode: 'BIRK',
    name: 'Reykjavik Keflavik',
    country: 'Iceland',
    timezone: 'GMT',
  };

  const stJohns: Airport = {
    id: '6cf1fcd8-d072-46b5-8132-bd885b43dd97',
    icaoCode: 'CYYT',
    name: 'St. Johns Intl',
    country: 'Canada',
    timezone: 'GMT-3:30',
  };

  const philadelphia: Airport = {
    id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554',
    icaoCode: 'KPHL',
    name: 'Philadelphia Intl',
    country: 'United States of America',
    timezone: 'GMT-5',
  };

  const boston: Airport = {
    id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3',
    icaoCode: 'KBOS',
    name: 'Boston Logan Intl',
    country: 'United States of America',
    timezone: 'GMT-5',
  };

  const bremen: Airport = {
    id: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf',
    icaoCode: 'EDDW',
    name: 'Bremen',
    country: 'Germany',
    timezone: 'GMT+1',
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

async function loadOperators(): Promise<void> {
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
    callsign: 'Lufthansa',
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

  for (const operator of [condor, lufthansa, lot, american, british]) {
    await prisma.operator.create({ data: operator });
  }
}

async function loadAircraft(): Promise<void> {
  const a330: Aircraft = {
    id: '9f5da1a4-f09e-4961-8299-82d688337d1f',
    icaoCode: 'A339',
    shortName: 'A330-900',
    fullName: 'Airbus A330-900 neo',
    registration: 'D-AIMC',
    selcal: 'LR-CK',
    livery: 'Fanhansa (2024)',
  };

  const a321: Aircraft = {
    id: '7d27a031-5abb-415f-bde5-1aa563ad394e',
    icaoCode: 'A321',
    shortName: 'A321-251',
    fullName: 'Airbus A331-251 SL ACT-2',
    registration: 'D-AIDA',
    selcal: 'SK-PK',
    livery: 'Sunshine (2024)',
  };

  const a319: Aircraft = {
    id: '3f34bc59-c9c3-4ad0-88fa-2cc570298602',
    icaoCode: 'A319',
    shortName: 'A319-200',
    fullName: 'Airbus A319-200(neo)',
    registration: 'D-AIDK',
    selcal: 'MS-KL',
    livery: 'Water (2024)',
  };

  const b773: Aircraft = {
    id: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98',
    icaoCode: 'B773',
    shortName: 'B777-300ER',
    fullName: 'Boeing 777-300ER',
    registration: 'N78881',
    selcal: 'KY-JO',
    livery: 'Team USA (2023)',
  };

  for (const aircraft of [a330, a321, a319, b773]) {
    await prisma.aircraft.create({ data: aircraft });
  }
}

async function loadFlights(): Promise<void> {
  const dlh450 = {
    id: '3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05',
    flightNumber: 'LH 450',
    callsign: 'DLH 450',
    status: FlightStatus.Created,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B773
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2024-01-01 12:00'),
        takeoffTime: new Date('2024-01-01 12:15'),
        arrivalTime: new Date('2024-01-01 21:00'),
        onBlockTime: new Date('2024-01-01 21:10'),
      },
      estimated: {
        offBlockTime: new Date('2024-01-01 12:00'),
        takeoffTime: new Date('2024-01-01 12:15'),
        arrivalTime: new Date('2024-01-01 21:00'),
        onBlockTime: new Date('2024-01-01 21:10'),
      },
      actual: {
        offBlockTime: new Date('2024-01-01 12:00'),
        takeoffTime: new Date('2024-01-01 12:15'),
        arrivalTime: new Date('2024-01-01 21:00'),
        onBlockTime: new Date('2024-01-01 21:10'),
      },
    } as Prisma.InputJsonValue,
  };

  const departureAirport = await prisma.airport.findFirstOrThrow({
    // Frankfurt
    where: { id: 'f35c094a-bec5-4803-be32-bd80a14b441a' },
  });

  const arrivalAirport = await prisma.airport.findFirstOrThrow({
    // New York JFK
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' },
  });

  const firstAlternateAirport = await prisma.airport.findFirstOrThrow({
    // Philadelphia
    where: { id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554' },
  });
  const secondAlternateAirport = await prisma.airport.findFirstOrThrow({
    // Boston Logan Intl
    where: { id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3' },
  });

  const etopsAlternateAirport = await prisma.airport.findFirstOrThrow({
    // St. Johns
    where: { id: '6cf1fcd8-d072-46b5-8132-bd885b43dd97' },
  });

  const flight = await prisma.flight.create({ data: dlh450 });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: departureAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Departure,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: arrivalAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Destination,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: firstAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: secondAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etopsAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
