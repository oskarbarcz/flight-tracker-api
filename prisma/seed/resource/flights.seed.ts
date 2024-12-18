import { FlightStatus } from '../../../src/flights/entities/flight.entity';
import { Prisma, PrismaClient } from '@prisma/client';
import { AirportType } from '../../../src/airports/entities/airport.entity';

/**
 * DLH 450 | 3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05
 * Frankfurt Rhein/Main (EDDF) -> New York JFK (KJFK)
 * status: Created
 */
async function loadDlh450(prisma: PrismaClient): Promise<void> {
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
    } as Prisma.InputJsonValue,
  };

  const dlh450departureAirport = await prisma.airport.findFirstOrThrow({
    // Frankfurt
    where: { id: 'f35c094a-bec5-4803-be32-bd80a14b441a' },
  });

  const dlh450arrivalAirport = await prisma.airport.findFirstOrThrow({
    // New York JFK
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' },
  });

  const dlh450firstAlternateAirport = await prisma.airport.findFirstOrThrow({
    // Philadelphia
    where: { id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554' },
  });
  const dlh450secondAlternateAirport = await prisma.airport.findFirstOrThrow({
    // Boston Logan Intl
    where: { id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3' },
  });

  const dlh450etopsAlternateAirport = await prisma.airport.findFirstOrThrow({
    // St. Johns
    where: { id: '6cf1fcd8-d072-46b5-8132-bd885b43dd97' },
  });

  const dlh450flight = await prisma.flight.create({ data: dlh450 });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450departureAirport.id } },
      flight: { connect: { id: dlh450flight.id } },
      airportType: AirportType.Departure,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450arrivalAirport.id } },
      flight: { connect: { id: dlh450flight.id } },
      airportType: AirportType.Destination,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450firstAlternateAirport.id } },
      flight: { connect: { id: dlh450flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450secondAlternateAirport.id } },
      flight: { connect: { id: dlh450flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450etopsAlternateAirport.id } },
      flight: { connect: { id: dlh450flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });
}

/**
 * UAL 4905 | 23da8bc9-a21b-4678-b2e9-1151d3bd15ab
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Closed
 */
async function loadUal4905(prisma: PrismaClient): Promise<void> {
  const ual4905 = {
    id: '23da8bc9-a21b-4678-b2e9-1151d3bd15ab',
    flightNumber: 'AA 4905',
    callsign: 'AAL 4905',
    status: FlightStatus.Closed,
    aircraftId: '7d27a031-5abb-415f-bde5-1aa563ad394e', // A321
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
      actual: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
    } as Prisma.InputJsonValue,
  };

  const ual4905departureAirport = await prisma.airport.findFirstOrThrow({
    // Boston Logan
    where: { id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3' },
  });

  const ual4905arrivalAirport = await prisma.airport.findFirstOrThrow({
    // Philadelphia
    where: { id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554' },
  });

  const ual4905alternateAirport = await prisma.airport.findFirstOrThrow({
    // New York JFK
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' },
  });

  const ual4905flight = await prisma.flight.create({ data: ual4905 });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4905departureAirport.id } },
      flight: { connect: { id: ual4905flight.id } },
      airportType: AirportType.Departure,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4905arrivalAirport.id } },
      flight: { connect: { id: ual4905flight.id } },
      airportType: AirportType.Destination,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4905alternateAirport.id } },
      flight: { connect: { id: ual4905flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });
}

/**
 * UAL 4906 | 23952e79-6b38-49ed-a1db-bd4d9b3cedab
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Ready
 */
async function loadUal4906(prisma: PrismaClient): Promise<void> {
  const ual4906 = {
    id: '23952e79-6b38-49ed-a1db-bd4d9b3cedab',
    flightNumber: 'AA 4906',
    callsign: 'AAL 4906',
    status: FlightStatus.Ready,
    aircraftId: '7d27a031-5abb-415f-bde5-1aa563ad394e', // A321
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
    } as Prisma.InputJsonValue,
  };

  const ual4906departureAirport = await prisma.airport.findFirstOrThrow({
    // Boston Logan
    where: { id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3' },
  });

  const ual4906arrivalAirport = await prisma.airport.findFirstOrThrow({
    // Philadelphia
    where: { id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554' },
  });

  const ual4906alternateAirport = await prisma.airport.findFirstOrThrow({
    // New York JFK
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' },
  });

  const ual4906flight = await prisma.flight.create({ data: ual4906 });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4906departureAirport.id } },
      flight: { connect: { id: ual4906flight.id } },
      airportType: AirportType.Departure,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4906arrivalAirport.id } },
      flight: { connect: { id: ual4906flight.id } },
      airportType: AirportType.Destination,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4906alternateAirport.id } },
      flight: { connect: { id: ual4906flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });
}

/**
 * UAL 4907 | e91e13a9-09d8-48bf-8453-283cef467b88
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Created
 */
async function loadUal4907(prisma: PrismaClient): Promise<void> {
  const ual4907 = {
    id: 'e91e13a9-09d8-48bf-8453-283cef467b88',
    flightNumber: 'AA 4907',
    callsign: 'AAL 4907',
    status: FlightStatus.Created,
    aircraftId: '7d27a031-5abb-415f-bde5-1aa563ad394e', // A321
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
    } as Prisma.InputJsonValue,
  };

  const ual4907departureAirport = await prisma.airport.findFirstOrThrow({
    // Boston Logan
    where: { id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3' },
  });

  const ual4907arrivalAirport = await prisma.airport.findFirstOrThrow({
    // Philadelphia
    where: { id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554' },
  });

  const ual4907alternateAirport = await prisma.airport.findFirstOrThrow({
    // New York JFK
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' },
  });

  const ual4907flight = await prisma.flight.create({ data: ual4907 });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4907departureAirport.id } },
      flight: { connect: { id: ual4907flight.id } },
      airportType: AirportType.Departure,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4907arrivalAirport.id } },
      flight: { connect: { id: ual4907flight.id } },
      airportType: AirportType.Destination,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4907alternateAirport.id } },
      flight: { connect: { id: ual4907flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });
}

/**
 * UAL 4908 | b3899775-278e-4496-add1-21385a13d93e
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Checked in
 */
async function loadUal4908(prisma: PrismaClient): Promise<void> {
  const data = {
    id: 'b3899775-278e-4496-add1-21385a13d93e',
    flightNumber: 'AA 4908',
    callsign: 'AAL 4908',
    status: FlightStatus.CheckedIn,
    aircraftId: '7d27a031-5abb-415f-bde5-1aa563ad394e', // A321
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
    } as Prisma.InputJsonValue,
  };

  const departureAirport = await prisma.airport.findFirstOrThrow({
    // Boston Logan
    where: { id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3' },
  });

  const arrivalAirport = await prisma.airport.findFirstOrThrow({
    // Philadelphia
    where: { id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554' },
  });

  const alternateAirport = await prisma.airport.findFirstOrThrow({
    // New York JFK
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' },
  });

  const flight = await prisma.flight.create({ data: data });

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
      airport: { connect: { id: alternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });
}

/**
 * UAL 4909 | 05986dd3-ff01-4112-ad35-ecd85db05c77
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Boarding started
 */
async function loadUal4909(prisma: PrismaClient): Promise<void> {
  const data = {
    id: '05986dd3-ff01-4112-ad35-ecd85db05c77',
    flightNumber: 'AA 4909',
    callsign: 'AAL 4909',
    status: FlightStatus.BoardingStarted,
    aircraftId: '7d27a031-5abb-415f-bde5-1aa563ad394e', // A321
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
    } as Prisma.InputJsonValue,
  };

  const departureAirport = await prisma.airport.findFirstOrThrow({
    // Boston Logan
    where: { id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3' },
  });

  const arrivalAirport = await prisma.airport.findFirstOrThrow({
    // Philadelphia
    where: { id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554' },
  });

  const alternateAirport = await prisma.airport.findFirstOrThrow({
    // New York JFK
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' },
  });

  const flight = await prisma.flight.create({ data: data });

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
      airport: { connect: { id: alternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });
}

/**
 * UAL 4910 | f14a2141-4737-4622-a387-40513ff3baf1
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Boarding finished
 */
async function loadUal4910(prisma: PrismaClient): Promise<void> {
  const data = {
    id: 'f14a2141-4737-4622-a387-40513ff3baf1',
    flightNumber: 'AA 4910',
    callsign: 'AAL 4920',
    status: FlightStatus.BoardingFinished,
    aircraftId: '7d27a031-5abb-415f-bde5-1aa563ad394e', // A321
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2024-01-01 13:00'),
        takeoffTime: new Date('2024-01-01 13:15'),
        arrivalTime: new Date('2024-01-01 16:00'),
        onBlockTime: new Date('2024-01-01 16:18'),
      },
    } as Prisma.InputJsonValue,
  };

  const departureAirport = await prisma.airport.findFirstOrThrow({
    // Boston Logan
    where: { id: 'c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3' },
  });

  const arrivalAirport = await prisma.airport.findFirstOrThrow({
    // Philadelphia
    where: { id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554' },
  });

  const alternateAirport = await prisma.airport.findFirstOrThrow({
    // New York JFK
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' },
  });

  const flight = await prisma.flight.create({ data: data });

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
      airport: { connect: { id: alternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });
}

export async function loadFlights(prisma: PrismaClient): Promise<void> {
  await loadDlh450(prisma);
  await loadUal4905(prisma);
  await loadUal4906(prisma);
  await loadUal4907(prisma);
  await loadUal4908(prisma);
  await loadUal4909(prisma);
  await loadUal4910(prisma);
}