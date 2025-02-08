import { FlightStatus } from '../../../src/flights/entities/flight.entity';
import { Prisma, PrismaClient } from '@prisma/client';
import { AirportType } from '../../../src/airports/entities/airport.entity';

/**
 * DLH 450 | 3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05
 * Frankfurt Rhein/Main (EDDF) -> New York JFK (KJFK)
 * status: Created
 */
async function loadDLH450(prisma: PrismaClient): Promise<void> {
  const dlh450 = {
    id: '3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05',
    flightNumber: 'LH 450',
    callsign: 'DLH 450',
    status: FlightStatus.Created,
    operatorId: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d', // Lufthansa
    aircraftId: '9f5da1a4-f09e-4961-8299-82d688337d1f', // A339
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 12:00'),
        takeoffTime: new Date('2025-01-01 12:15'),
        arrivalTime: new Date('2025-01-01 21:00'),
        onBlockTime: new Date('2025-01-01 21:10'),
      },
    } as Prisma.InputJsonValue,
    loadsheets: {} as Prisma.InputJsonValue,
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
 * AAL 4905 | 23da8bc9-a21b-4678-b2e9-1151d3bd15ab
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Closed
 */
async function loadAAL4905(prisma: PrismaClient): Promise<void> {
  const ual4905 = {
    id: '23da8bc9-a21b-4678-b2e9-1151d3bd15ab',
    flightNumber: 'AA 4905',
    callsign: 'AAL 4905',
    status: FlightStatus.Closed,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      actual: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
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
 * AAL 4906 | 23952e79-6b38-49ed-a1db-bd4d9b3cedab
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Ready
 */
async function loadAAL4906(prisma: PrismaClient): Promise<void> {
  const ual4906 = {
    id: '23952e79-6b38-49ed-a1db-bd4d9b3cedab',
    flightNumber: 'AA 4906',
    callsign: 'AAL 4906',
    status: FlightStatus.Ready,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
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
 * AAL 4907 | e91e13a9-09d8-48bf-8453-283cef467b88
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Created
 */
async function loadAAL4907(prisma: PrismaClient): Promise<void> {
  const ual4907 = {
    id: 'e91e13a9-09d8-48bf-8453-283cef467b88',
    flightNumber: 'AA 4907',
    callsign: 'AAL 4907',
    status: FlightStatus.Created,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
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
 * AAL 4908 | b3899775-278e-4496-add1-21385a13d93e
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Checked in
 */
async function loadAAL4908(prisma: PrismaClient): Promise<void> {
  const data = {
    id: 'b3899775-278e-4496-add1-21385a13d93e',
    flightNumber: 'AA 4908',
    callsign: 'AAL 4908',
    status: FlightStatus.CheckedIn,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
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
 * AAL 4909 | 05986dd3-ff01-4112-ad35-ecd85db05c77
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Boarding started
 */
async function loadAAL4909(prisma: PrismaClient): Promise<void> {
  const data = {
    id: '05986dd3-ff01-4112-ad35-ecd85db05c77',
    flightNumber: 'AA 4909',
    callsign: 'AAL 4909',
    status: FlightStatus.BoardingStarted,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
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
 * AAL 4910 | f14a2141-4737-4622-a387-40513ff3baf1
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Boarding finished
 */
async function loadAAL4910(prisma: PrismaClient): Promise<void> {
  const data = {
    id: 'f14a2141-4737-4622-a387-40513ff3baf1',
    flightNumber: 'AA 4910',
    callsign: 'AAL 4910',
    status: FlightStatus.BoardingFinished,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
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
 * AAL 4911 | 7105891a-8008-4b47-b473-c81c97615ad7
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Taxiing out
 */
async function loadAAL4911(prisma: PrismaClient): Promise<void> {
  const data = {
    id: '7105891a-8008-4b47-b473-c81c97615ad7',
    flightNumber: 'AA 4911',
    callsign: 'AAL 4911',
    status: FlightStatus.TaxiingOut,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
      },
      actual: {
        offBlockTime: new Date('2025-01-01 13:10'),
        takeoffTime: null,
        arrivalTime: null,
        onBlockTime: null,
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
 * AAL 4912 | 2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: In cruise
 */
async function loadAAL4912(prisma: PrismaClient): Promise<void> {
  const data = {
    id: '2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d',
    flightNumber: 'AA 4912',
    callsign: 'AAL 4912',
    status: FlightStatus.InCruise,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
      },
      actual: {
        offBlockTime: new Date('2025-01-01 13:10'),
        takeoffTime: new Date('2025-01-01 13:25'),
        arrivalTime: null,
        onBlockTime: null,
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
 * AAL 4913 | 04be266c-df78-4bec-9f50-281cc02ce7f2
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Taxiing in
 */
async function loadAAL4913(prisma: PrismaClient): Promise<void> {
  const data = {
    id: '04be266c-df78-4bec-9f50-281cc02ce7f2',
    flightNumber: 'AA 4913',
    callsign: 'AAL 4913',
    status: FlightStatus.TaxiingIn,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
      },
      actual: {
        offBlockTime: new Date('2025-01-01 13:10'),
        takeoffTime: new Date('2025-01-01 13:25'),
        arrivalTime: new Date('2025-01-01 16:10'),
        onBlockTime: null,
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
 * AAL 4914 | 17d2f703-957d-4ad1-a620-3c187a70c26a
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: On block
 */
async function loadAAL4914(prisma: PrismaClient): Promise<void> {
  const data = {
    id: '17d2f703-957d-4ad1-a620-3c187a70c26a',
    flightNumber: 'AA 4914',
    callsign: 'AAL 4914',
    status: FlightStatus.OnBlock,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
      },
      actual: {
        offBlockTime: new Date('2025-01-01 13:10'),
        takeoffTime: new Date('2025-01-01 13:25'),
        arrivalTime: new Date('2025-01-01 16:10'),
        onBlockTime: new Date('2025-01-01 16:28'),
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
 * AAL 4915 | 5aada8ba-60c1-4e93-bcee-b59a7c555fdd
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Offboarding started
 */
async function loadAAL4915(prisma: PrismaClient): Promise<void> {
  const data = {
    id: '5aada8ba-60c1-4e93-bcee-b59a7c555fdd',
    flightNumber: 'AA 4915',
    callsign: 'AAL 4915',
    status: FlightStatus.OffboardingStarted,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
      },
      actual: {
        offBlockTime: new Date('2025-01-01 13:10'),
        takeoffTime: new Date('2025-01-01 13:25'),
        arrivalTime: new Date('2025-01-01 16:10'),
        onBlockTime: new Date('2025-01-01 16:28'),
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
 * AAL 4916 | 38644393-deee-434d-bfd1-7242abdbc4e1
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Offboarding finished
 */
async function loadAAL4916(prisma: PrismaClient): Promise<void> {
  const data = {
    id: '38644393-deee-434d-bfd1-7242abdbc4e1',
    flightNumber: 'AA 4916',
    callsign: 'AAL 4916',
    status: FlightStatus.OffboardingFinished,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
      },
      actual: {
        offBlockTime: new Date('2025-01-01 13:10'),
        takeoffTime: new Date('2025-01-01 13:25'),
        arrivalTime: new Date('2025-01-01 16:10'),
        onBlockTime: new Date('2025-01-01 16:28'),
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
 * AAL 4917 | d085c107-308d-48e6-9c93-beca6552a8a3
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Closed
 */
async function loadAAL4917(prisma: PrismaClient): Promise<void> {
  const data = {
    id: 'd085c107-308d-48e6-9c93-beca6552a8a3',
    flightNumber: 'AA 4917',
    callsign: 'AAL 4917',
    status: FlightStatus.Closed,
    aircraftId: 'a10c21e3-3ac1-4265-9d12-da9baefa2d98', // B77W
    operatorId: '1f630d38-ad24-47cc-950b-3783e71bbd10', // American Airlines
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 16:00'),
        onBlockTime: new Date('2025-01-01 16:18'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 13:00'),
        takeoffTime: new Date('2025-01-01 13:15'),
        arrivalTime: new Date('2025-01-01 15:50'),
        onBlockTime: new Date('2025-01-01 16:08'),
      },
      actual: {
        offBlockTime: new Date('2025-01-01 13:10'),
        takeoffTime: new Date('2025-01-01 13:25'),
        arrivalTime: new Date('2025-01-01 16:10'),
        onBlockTime: new Date('2025-01-01 16:28'),
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
  await loadDLH450(prisma);
  await loadAAL4905(prisma);
  await loadAAL4906(prisma);
  await loadAAL4907(prisma);
  await loadAAL4908(prisma);
  await loadAAL4909(prisma);
  await loadAAL4910(prisma);
  await loadAAL4911(prisma);
  await loadAAL4912(prisma);
  await loadAAL4913(prisma);
  await loadAAL4914(prisma);
  await loadAAL4915(prisma);
  await loadAAL4916(prisma);
  await loadAAL4917(prisma);
}
