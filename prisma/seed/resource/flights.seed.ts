import { FlightStatus } from '../../../src/modules/flights/entity/flight.entity';
import { FlightEventScope, Prisma, PrismaClient } from '@prisma/client';
import { AirportType } from '../../../src/modules/airports/entity/airport.entity';
import { Loadsheets } from '../../../src/modules/flights/entity/loadsheet.entity';
import { FlightEventType } from '../../../src/core/events/flight';
import {
  DiversionReason,
  DiversionReporterRole,
  DiversionSeverity,
} from '../../../src/modules/flights/entity/diversion.entity';

const prisma = new PrismaClient();

/**
 * DLH 450 | 3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05
 * Frankfurt Rhein/Main (EDDF) -> New York JFK (KJFK)
 * status: Created
 */
async function loadDLH450(): Promise<void> {
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
    loadsheets: {
      preliminary: null,
      final: null,
    } as Prisma.InputJsonValue & Loadsheets,
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

  const flight = await prisma.flight.create({ data: dlh450 });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450departureAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Departure,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450arrivalAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Destination,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450firstAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450secondAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: dlh450etopsAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '7b0d3d5a-879c-491c-b6e0-ec051ac9fbc4',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: 'e70f19df-81b4-4712-b4a5-16be22c85ebe',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '9db99c92-dd95-4089-b11b-abe3ac1d262b',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
    ],
  });
}

/**
 * AAL 4905 | 23da8bc9-a21b-4678-b2e9-1151d3bd15ab
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Closed
 */
async function loadAAL4905(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 366,
        payload: 28.3,
        cargo: 8.9,
        zeroFuelWeight: 202.9,
        blockFuel: 11.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
    positionReports: [
      {
        callsign: 'AAL4913',
        date: '2025-01-01T13:10:00.000Z',
        latitude: 60.317255208578054,
        longitude: 24.958945837172326,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4913',
        date: '2025-01-01T13:40:00.000Z',
        latitude: 58.68825909518984,
        longitude: 22.248460174236897,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4913',
        date: '2025-01-01T14:10:00.000Z',
        latitude: 55.587475442504896,
        longitude: 17.204921862764106,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4913',
        date: '2025-01-01T14:40:00.000Z',
        latitude: 54.37998045994538,
        longitude: 18.46850453127673,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
    ],
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

  const flight = await prisma.flight.create({ data: ual4905 });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4905departureAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Departure,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4905arrivalAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Destination,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4905alternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });

  await prisma.flightEvent.createMany({
    data: [
      {
        id: 'a9768272-3c05-4ffe-9370-1433869a139f',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: '38684c9d-55df-43fe-bf6e-f26cccf74d5a',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '36a2aa4d-40f6-4aaf-a2cd-10312104b683',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '9e67d36f-d941-4cbc-ab18-586f1a0b5a4c',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: '27b015f7-f415-4a0a-b12d-3fdc53073488',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:30'),
      },
      {
        id: '44a54d61-3b4d-4ecd-9b56-4a59223a9b78',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:55'),
      },
      {
        id: '0940b633-777d-4ecc-bd63-ef1b30c52c4a',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:00'),
      },
      {
        id: 'b22bf5bb-da96-4511-823a-df611efb72ae',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.TakeoffWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:15'),
      },
      {
        id: '4ebbc569-932c-4a17-b631-2af2739c10e3',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.ArrivalWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:00'),
      },
      {
        id: '0cb6d1ea-df6c-43f0-a1e5-1c2dd7af6fc7',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OnBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:18'),
      },
      {
        id: '46dd5137-b31b-4e5b-919c-cd30191763b1',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffboardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:20'),
      },
      {
        id: '19ffec62-89d4-4c91-b071-b4c0331777ce',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffboardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:40'),
      },
      {
        id: 'c7142a58-0c6c-41ef-aab7-a097a4e57385',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.FlightWasClosed,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:50'),
      },
    ],
  });
}

/**
 * AAL 4906 | 23952e79-6b38-49ed-a1db-bd4d9b3cedab
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Ready
 */
async function loadAAL4906(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: null,
    } as Prisma.InputJsonValue & Loadsheets,
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

  const flight = await prisma.flight.create({ data: ual4906 });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4906departureAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Departure,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4906arrivalAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Destination,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4906alternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '784319d9-a6be-41c4-ad5c-9c0f691faffb',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: 'f434d000-963a-4603-9e4d-92aed0195a89',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '85530a54-1d5a-4943-a9fb-9b5ef39f6fc5',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
    ],
  });
}

/**
 * AAL 4907 | e91e13a9-09d8-48bf-8453-283cef467b88
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Created
 */
async function loadAAL4907(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: null,
    } as Prisma.InputJsonValue & Loadsheets,
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

  const flight = await prisma.flight.create({ data: ual4907 });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4907departureAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Departure,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4907arrivalAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.Destination,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: ual4907alternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.DestinationAlternate,
    },
  });

  await prisma.flightEvent.createMany({
    data: [
      {
        id: 'a1d43d93-0958-45bc-aa5e-3b1c4a081d74',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
    ],
  });
}

/**
 * AAL 4908 | b3899775-278e-4496-add1-21385a13d93e
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Checked in
 */
async function loadAAL4908(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: null,
    } as Prisma.InputJsonValue & Loadsheets,
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

  await prisma.user.update({
    where: { id: 'fcf6f4bc-290d-43a9-843c-409cd47e143d' }, // Rick Doe user
    data: { currentFlightId: flight.id },
  });

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '6df6997c-98ad-43b1-8d36-72b921bec1c3',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: '4f9d78e7-b0c9-48a3-a5c8-27d6edd530a1',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '47c8db09-e786-4287-840c-b54278d543b5',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '82746826-3d70-40b0-93ac-d61d6af0ef43',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
    ],
  });
}

/**
 * AAL 4909 | 05986dd3-ff01-4112-ad35-ecd85db05c77
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Boarding started
 */
async function loadAAL4909(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: null,
    } as Prisma.InputJsonValue & Loadsheets,
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

  await prisma.flightEvent.createMany({
    data: [
      {
        id: 'f8fe29e2-335e-488e-9fea-b5c4647578ed',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: '08f2640d-a382-491a-9226-c6ed5cdbfd60',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '8297db05-76e4-416e-9f6f-fed2716296ea',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '9d2f1728-0882-4c65-b912-6d193f87a643',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: '9762e7f2-5cb6-48a1-bee2-077c6ed4452c',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
    ],
  });
}

/**
 * AAL 4910 | f14a2141-4737-4622-a387-40513ff3baf1
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Boarding finished
 */
async function loadAAL4910(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 366,
        payload: 28.3,
        cargo: 8.9,
        zeroFuelWeight: 202.9,
        blockFuel: 11.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
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

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '4e1cae7d-1cc4-493e-ae59-fcd87e97416a',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: 'e72a93c0-c3ad-4863-a994-f355f10989dd',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: 'fb3236f0-0318-40be-b581-3312ece412e7',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '9ac32500-3bad-471a-b6e1-577916abde24',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: '1489e92f-dde6-4d16-8a0a-f38b18f6e272',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
      {
        id: '66bcc725-7acd-42e9-b3db-1513176a537f',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:05'),
      },
    ],
  });
}

/**
 * AAL 4911 | 7105891a-8008-4b47-b473-c81c97615ad7
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Taxiing out
 */
async function loadAAL4911(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 366,
        payload: 28.3,
        cargo: 8.9,
        zeroFuelWeight: 202.9,
        blockFuel: 11.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
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

  await prisma.flightEvent.createMany({
    data: [
      {
        id: 'defe2649-c100-47b9-b254-d0db0d568103',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: '23f793e8-6f1a-4348-9ac1-5721788f89ce',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '612637bf-dffe-4a8c-a86b-785011e028df',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: 'e688c31b-1be9-4b08-a3a0-02628c5a5bfd',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: 'd834bd10-0fd1-4fb2-b77c-c04445bd32ca',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
      {
        id: 'a3c38a7e-f0fe-498d-bee2-7697dc0d0650',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:05'),
      },
      {
        id: '00cf79f0-5dee-4505-bc10-bc7178c57354',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:10'),
      },
    ],
  });
}

/**
 * AAL 4912 | 2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: In cruise
 */
async function loadAAL4912(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 366,
        payload: 28.3,
        cargo: 8.9,
        zeroFuelWeight: 202.9,
        blockFuel: 11.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
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

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '7032f11d-51b2-43ba-9cf1-ae1f144f0707',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: '9822a1b2-9715-40a5-94cb-d8b616637457',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '88651e15-57d0-468f-9231-bd2e1edcff66',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '3d802611-728b-41cd-a4d1-f9fc91aaca18',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: 'd2794a43-60e2-4abe-9803-ce75dfa2a37b',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
      {
        id: '2dba1cb5-d25c-4ade-9d46-e30eb8ecb24a',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:05'),
      },
      {
        id: 'd03bb44f-88d8-42cd-aa29-342eda6ebbf3',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:10'),
      },
      {
        id: '0108b08b-9c45-49ba-a3cb-a3ae172ce92c',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.TakeoffWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:25'),
      },
    ],
  });
}

/**
 * AAL 4913 | 04be266c-df78-4bec-9f50-281cc02ce7f2
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Taxiing in
 */
async function loadAAL4913(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 366,
        payload: 28.3,
        cargo: 8.9,
        zeroFuelWeight: 202.9,
        blockFuel: 11.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
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

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '079f2632-c0ab-4dd1-9646-522b5c370fe5',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: 'dd8871ca-4d02-4b8f-910f-829fa78b9300',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '95d4986f-4211-4209-8479-deb63de7239f',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '2d5e21dd-b89d-4f40-bf8b-86317da51147',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: '527def55-574b-4740-8876-c6af56e7c060',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
      {
        id: '2a64d3fa-3615-4ced-a0ea-5d528f6e8cae',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:05'),
      },
      {
        id: '72655033-7a10-40d7-824b-5f20784f762d',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:10'),
      },
      {
        id: 'e356f0df-f0a8-4c67-a7e9-8d1bdc3c5249',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.TakeoffWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:25'),
      },
      {
        id: 'd6880a1e-4c04-49ca-ab15-7b04d7a4aac4',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.ArrivalWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:10'),
      },
    ],
  });
}

/**
 * AAL 4914 | 17d2f703-957d-4ad1-a620-3c187a70c26a
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: On block
 */
async function loadAAL4914(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 366,
        payload: 28.3,
        cargo: 8.9,
        zeroFuelWeight: 202.9,
        blockFuel: 11.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
    positionReports: [
      {
        callsign: 'AAL4914',
        date: '2025-01-01T13:10:00.000Z',
        latitude: 60.31725520857805,
        longitude: 24.95894583717233,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4914',
        date: '2025-01-01T13:40:00.000Z',
        latitude: 58.68825909518984,
        longitude: 22.2484601742369,
        altitude: 24000,
        verticalRate: 1500,
        groundSpeed: 140,
        track: 236,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4914',
        date: '2025-01-01T14:10:00.000Z',
        latitude: 55.5874754425049,
        longitude: 17.20492186276411,
        altitude: 35000,
        verticalRate: 0,
        groundSpeed: 195,
        track: 233,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4914',
        date: '2025-01-01T14:40:00.000Z',
        latitude: 54.37998045994538,
        longitude: 18.46850453127673,
        altitude: 12000,
        verticalRate: -1200,
        groundSpeed: 151,
        track: 229,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
    ],
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

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '8d2510dd-bc5e-48a1-8251-79abb33ec9a4',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: '355c57e9-54b4-4b3f-917f-dd33c9f9f9ef',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '69bf2ba1-1ac4-47e7-8732-5ade52be92be',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '64e4ae88-7adf-4c29-9e95-061c171a70e3',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: '3738a2dc-59c3-4a34-9058-ff57a3cd12bc',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
      {
        id: 'be16d4a7-83e0-46cb-93fc-2a654338f132',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:05'),
      },
      {
        id: 'af5b4d42-c963-488f-bdc7-aefad1bb2d49',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:10'),
      },
      {
        id: '26373247-4b63-4c90-8091-8efae31dbee7',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.TakeoffWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:25'),
      },
      {
        id: '38a79e68-aad5-4e1c-ad8e-edce069372d9',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.ArrivalWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:10'),
      },
      {
        id: 'd195128e-a2c8-43d9-9700-feb4481620ea',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OnBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:28'),
      },
    ],
  });
}

/**
 * AAL 4915 | 5aada8ba-60c1-4e93-bcee-b59a7c555fdd
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Offboarding started
 */
async function loadAAL4915(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 366,
        payload: 28.3,
        cargo: 8.9,
        zeroFuelWeight: 202.9,
        blockFuel: 11.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
    positionReports: [
      {
        callsign: 'AAL4915',
        date: '2025-01-01T13:10:00.000Z',
        latitude: 60.317255208578054,
        longitude: 24.958945837172326,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4915',
        date: '2025-01-01T13:40:00.000Z',
        latitude: 58.68825909518984,
        longitude: 22.248460174236897,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4915',
        date: '2025-01-01T14:10:00.000Z',
        latitude: 55.587475442504896,
        longitude: 17.204921862764106,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4915',
        date: '2025-01-01T14:40:00.000Z',
        latitude: 54.37998045994538,
        longitude: 18.46850453127673,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
    ],
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

  await prisma.flightEvent.createMany({
    data: [
      {
        id: 'b68d7b8f-a2a6-4c97-aaf0-039ab2541567',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: '4c3128ed-9c1b-4815-8e0b-8b8d67912706',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: 'eef98d03-6ebf-4643-9a3f-49c7a9d7dd4e',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '98e76e75-ca05-48bc-b676-f5e3c58769a6',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: 'd8a68b2d-4b3d-4c96-97cb-ba6e34e14747',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
      {
        id: '6c00677b-077f-42f3-b65f-0fdd9de92869',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:05'),
      },
      {
        id: '51cfbf54-1c17-4fdc-b56f-385aa11311e4',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:10'),
      },
      {
        id: '26e1178c-3696-4127-abfd-024a2a832e91',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.TakeoffWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:25'),
      },
      {
        id: '3c75fcea-5a2d-4353-8960-b27eb6733e8b',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.ArrivalWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:10'),
      },
      {
        id: '620c5ac4-8224-4dab-a37b-32ecd858b4b4',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OnBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:28'),
      },
      {
        id: 'f7848f6d-8e4e-4554-a1ed-db99779c16dd',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffboardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:30'),
      },
    ],
  });
}

/**
 * AAL 4916 | 38644393-deee-434d-bfd1-7242abdbc4e1
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Offboarding finished
 */
async function loadAAL4916(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 366,
        payload: 28.3,
        cargo: 8.9,
        zeroFuelWeight: 202.9,
        blockFuel: 11.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
    positionReports: [
      {
        callsign: 'AAL4916',
        date: '2025-01-01T13:10:00.000Z',
        latitude: 60.317255208578054,
        longitude: 24.958945837172326,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4916',
        date: '2025-01-01T13:40:00.000Z',
        latitude: 58.68825909518984,
        longitude: 22.248460174236897,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4916',
        date: '2025-01-01T14:10:00.000Z',
        latitude: 55.587475442504896,
        longitude: 17.204921862764106,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4916',
        date: '2025-01-01T14:40:00.000Z',
        latitude: 54.37998045994538,
        longitude: 18.46850453127673,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
    ],
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

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '299705bd-4cdc-462f-941e-907061a530d9',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: 'b5242b30-ac97-4014-9000-05773ed394a4',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '083304c4-85be-4ebf-9c2d-757b714a23f7',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '346e6985-299c-49b3-9c76-6ee5ee679e43',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: '975140bc-8cac-4587-bddd-0a7acfb7a15f',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
      {
        id: '69b9a8a4-781c-44e9-8430-3fdd434def23',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:05'),
      },
      {
        id: 'be8c9559-0273-4f04-b480-062628bb670d',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:10'),
      },
      {
        id: 'e9f6ea80-395a-4859-a7c3-2bd93fc16066',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.TakeoffWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:25'),
      },
      {
        id: 'e342f02c-b0b5-4921-8ae3-51a28ee2bdd8',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.ArrivalWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:10'),
      },
      {
        id: 'beb79715-d10d-49b3-acab-e96d9e0f37a8',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OnBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:28'),
      },
      {
        id: 'a9e2c75c-c22a-41ab-bc00-8602f7f373ed',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffboardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:30'),
      },
      {
        id: 'fbe0b258-8e73-419d-abde-1194ca15944d',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffboardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:50'),
      },
    ],
  });
}

/**
 * AAL 4917 | d085c107-308d-48e6-9c93-beca6552a8a3
 * Boston Logan Intl (KBOS) -> Philadelphia Intl (KPHL)
 * status: Closed
 */
async function loadAAL4917(): Promise<void> {
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 370,
        payload: 40.3,
        cargo: 8.5,
        zeroFuelWeight: 208.9,
        blockFuel: 12.7,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 0,
          cabinCrew: 6,
        },
        passengers: 366,
        payload: 28.3,
        cargo: 8.9,
        zeroFuelWeight: 202.9,
        blockFuel: 11.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
    positionReports: [
      {
        callsign: 'AAL4917',
        date: '2025-01-01T13:10:00.000Z',
        latitude: 60.317255208578054,
        longitude: 24.958945837172326,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4917',
        date: '2025-01-01T13:40:00.000Z',
        latitude: 58.68825909518984,
        longitude: 22.248460174236897,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4917',
        date: '2025-01-01T14:10:00.000Z',
        latitude: 55.587475442504896,
        longitude: 17.204921862764106,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'AAL4917',
        date: '2025-01-01T14:40:00.000Z',
        latitude: 54.37998045994538,
        longitude: 18.46850453127673,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
    ],
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

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '152225a5-a47f-469d-84ac-13888821d4d2',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: '8d1cef04-f2a6-4544-992e-3b2bb1de4191',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: 'e997ff96-76db-4949-8fe7-23f6391fc1a9',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: '140b5d0e-221d-4575-86fe-44b54b805012',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: '973707fb-4bf8-4681-9b58-01b61a1f8252',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
      {
        id: '64329e64-8179-483e-801a-ccc6d992b5e6',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:05'),
      },
      {
        id: '9c783440-9858-4d62-81e4-470897744997',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:10'),
      },
      {
        id: 'a2c3bab0-c2fd-42c8-adda-32b452bcd92c',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.TakeoffWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:25'),
      },
      {
        id: '73c18a5f-a48a-4a77-b377-d4159ce21029',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.ArrivalWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:10'),
      },
      {
        id: '015b921e-c314-4d0c-8c1c-5f697bc31e93',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OnBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:28'),
      },
      {
        id: '735a417f-7ad5-4cea-9b80-902d10b60486',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffboardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:30'),
      },
      {
        id: '05ab2215-6e04-48f4-aecd-064f3cb25f18',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.OffboardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:50'),
      },
      {
        id: 'fc6f118d-cb4a-4f11-ae09-f8520d846513',
        // Rick Doe, Cabin Crew
        actorId: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
        flightId: flight.id,
        type: FlightEventType.FlightWasClosed,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 17:00'),
      },
    ],
  });
}

/**
 * DLH 40 | 48760636-9520-4863-b32f-f3618556feb7
 * Rotation 2025-01
 * Boston Frankfurt (EDDF) -> New York JFK (KJFK)
 * status: Closed
 */
async function loadDLH40(): Promise<void> {
  const data = {
    id: '48760636-9520-4863-b32f-f3618556feb7',
    flightNumber: 'LH 40',
    callsign: 'DLH 40',
    status: FlightStatus.Closed,
    aircraftId: '9f5da1a4-f09e-4961-8299-82d688337d1f', // A330
    operatorId: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d', // Lufthansa,
    rotationId: 'bd8f2d64-a647-42da-be63-c6589915e6c9', // 2025-01
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-01 17:40'),
        takeoffTime: new Date('2025-01-01 18:00'),
        arrivalTime: new Date('2025-01-02 02:00'),
        onBlockTime: new Date('2025-01-02 02:15'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-01 17:40'),
        takeoffTime: new Date('2025-01-01 18:00'),
        arrivalTime: new Date('2025-01-02 02:30'),
        onBlockTime: new Date('2025-01-02 02:45'),
      },
      actual: {
        offBlockTime: new Date('2025-01-01 17:45'),
        takeoffTime: new Date('2025-01-01 18:00'),
        arrivalTime: new Date('2025-01-02 02:30'),
        onBlockTime: new Date('2025-01-02 02:45'),
      },
    } as Prisma.InputJsonValue,
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 1,
          cabinCrew: 12,
        },
        passengers: 293,
        payload: 30.6,
        cargo: 7.3,
        zeroFuelWeight: 157.9,
        blockFuel: 53.0,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 1,
          cabinCrew: 12,
        },
        passengers: 293,
        payload: 30.6,
        cargo: 7.3,
        zeroFuelWeight: 157.9,
        blockFuel: 53.0,
      },
    } as Prisma.InputJsonValue & Loadsheets,
    positionReports: [
      {
        callsign: 'DLH40',
        date: '2025-01-01T13:10:00.000Z',
        latitude: 60.317255208578054,
        longitude: 24.958945837172326,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'DLH40',
        date: '2025-01-01T13:40:00.000Z',
        latitude: 58.68825909518984,
        longitude: 22.248460174236897,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'DLH40',
        date: '2025-01-01T14:10:00.000Z',
        latitude: 55.587475442504896,
        longitude: 17.204921862764106,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
      {
        callsign: 'DLH40',
        date: '2025-01-01T14:40:00.000Z',
        latitude: 54.37998045994538,
        longitude: 18.46850453127673,
        altitude: 8500,
        verticalRate: 1800,
        groundSpeed: 285,
        track: 225,
        isOnGround: false,
        squawk: '2453',
        alert: false,
        emergency: false,
        spi: false,
      },
    ],
  };

  const departureAirport = await prisma.airport.findFirstOrThrow({
    where: { id: 'f35c094a-bec5-4803-be32-bd80a14b441a' }, // Frankfurt
  });

  const arrivalAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' }, // New York JFK
  });

  const alternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: 'e764251b-bb25-4e8b-8cc7-11b0397b4554' }, // Philadelphia
  });

  const etopsAlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '6cf1fcd8-d072-46b5-8132-bd885b43dd97' }, // St. John's
  });

  const etops2AlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a' }, // Reykjavik
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

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etopsAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etops2AlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });
}

/**
 * DLH 41 | e8e17e59-67d7-4a6c-a0bd-425ffa6bed66
 * Rotation 2025-01
 * New York JFK (KJFK) -> Boston Frankfurt (EDDF)
 * status: Created
 */
async function loadDLH41(): Promise<void> {
  const data = {
    id: 'e8e17e59-67d7-4a6c-a0bd-425ffa6bed66',
    flightNumber: 'LH 41',
    callsign: 'DLH 41',
    status: FlightStatus.Created,
    aircraftId: '9f5da1a4-f09e-4961-8299-82d688337d1f', // A330
    operatorId: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d', // Lufthansa,
    rotationId: 'bd8f2d64-a647-42da-be63-c6589915e6c9', // 2025-01
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-02 04:00'),
        takeoffTime: new Date('2025-01-02 04:20'),
        arrivalTime: new Date('2025-01-02 11:30'),
        onBlockTime: new Date('2025-01-02 11:45'),
      },
    } as Prisma.InputJsonValue,
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 1,
          cabinCrew: 12,
        },
        passengers: 335,
        payload: 34.9,
        cargo: 8.4,
        zeroFuelWeight: 162.3,
        blockFuel: 47.9,
      },
      final: null,
    } as Prisma.InputJsonValue & Loadsheets,
  };

  const departureAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' }, // New York JFK
  });

  const arrivalAirport = await prisma.airport.findFirstOrThrow({
    where: { id: 'f35c094a-bec5-4803-be32-bd80a14b441a' }, // Frankfurt
  });

  const alternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf' }, // Bremen
  });

  const etopsAlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a' }, // Reykjavik
  });

  const etops2AlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '6cf1fcd8-d072-46b5-8132-bd885b43dd97' }, // St. John's
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

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etopsAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etops2AlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });
}

/**
 * DLH 42 | 006f0754-1ed7-4ae1-9f91-fae2d446a6e7
 * Rotation 2025-02
 * Boston Frankfurt (EDDF) -> New York JFK (KJFK)
 * status: Ready
 */
async function loadDLH42(): Promise<void> {
  const data = {
    id: '006f0754-1ed7-4ae1-9f91-fae2d446a6e7',
    flightNumber: 'LH 42',
    callsign: 'DLH 42',
    status: FlightStatus.CheckedIn,
    aircraftId: '9f5da1a4-f09e-4961-8299-82d688337d1f', // A330
    operatorId: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d', // Lufthansa,
    rotationId: '4cb9b5a8-7cac-4526-a0f7-f158fd14e9d1', // 2025-02
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-02 17:40'),
        takeoffTime: new Date('2025-01-02 18:00'),
        arrivalTime: new Date('2025-01-03 02:00'),
        onBlockTime: new Date('2025-01-03 02:15'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-02 17:40'),
        takeoffTime: new Date('2025-01-02 18:00'),
        arrivalTime: new Date('2025-01-03 02:30'),
        onBlockTime: new Date('2025-01-03 02:45'),
      },
    } as Prisma.InputJsonValue,
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 1,
          cabinCrew: 12,
        },
        passengers: 293,
        payload: 30.6,
        cargo: 7.3,
        zeroFuelWeight: 157.9,
        blockFuel: 53.0,
      },
    } as Prisma.InputJsonValue & Loadsheets,
  };

  const departureAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' }, // New York JFK
  });

  const arrivalAirport = await prisma.airport.findFirstOrThrow({
    where: { id: 'f35c094a-bec5-4803-be32-bd80a14b441a' }, // Frankfurt
  });

  const alternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf' }, // Bremen
  });

  const etopsAlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a' }, // Reykjavik
  });

  const etops2AlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '6cf1fcd8-d072-46b5-8132-bd885b43dd97' }, // St. John's
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

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etopsAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etops2AlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });

  await prisma.user.update({
    where: { id: '725f5df2-0c78-4fe8-89a2-52566c89cf7f' }, // Alan Doe user
    data: { currentFlightId: flight.id },
  });

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '9e61ccc9-d6be-4f42-a38f-947cbfe9dcf9',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-02 11:00'),
      },
      {
        id: '9eb7eae9-af3c-4eac-bdff-e82e9b852cfe',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-02 11:05'),
      },
      {
        id: '1fce1306-6bfc-45a2-8c38-b61a61aa760a',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-02 11:10'),
      },
      {
        id: '96d9b78b-fe2c-4ce5-98f2-807ccaf74b85',
        // Alan Doe, Cabin Crew
        actorId: '725f5df2-0c78-4fe8-89a2-52566c89cf7f',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-02 12:00'),
      },
    ],
  });
}

/**
 * DLH 43 | d4a25ef2-39cf-484c-af00-a548999e8699
 * Rotation 2025-03
 * New York JFK (KJFK) -> Boston Frankfurt (EDDF)
 * status: Offboarding finished
 */
async function loadDLH43(): Promise<void> {
  const data = {
    id: 'd4a25ef2-39cf-484c-af00-a548999e8699',
    flightNumber: 'LH 43',
    callsign: 'DLH 43',
    status: FlightStatus.OffboardingFinished,
    aircraftId: '9f5da1a4-f09e-4961-8299-82d688337d1f', // A330
    operatorId: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d', // Lufthansa,
    rotationId: 'c2e12afb-a712-45aa-9ba5-fec71868e59a', // 2025-03
    timesheet: {
      scheduled: {
        offBlockTime: new Date('2025-01-03 04:00'),
        takeoffTime: new Date('2025-01-03 04:20'),
        arrivalTime: new Date('2025-01-03 11:30'),
        onBlockTime: new Date('2025-01-03 11:45'),
      },
      estimated: {
        offBlockTime: new Date('2025-01-03 04:00'),
        takeoffTime: new Date('2025-01-03 04:20'),
        arrivalTime: new Date('2025-01-03 11:30'),
        onBlockTime: new Date('2025-01-03 11:45'),
      },
      actual: {
        offBlockTime: new Date('2025-01-03 04:00'),
        takeoffTime: new Date('2025-01-03 04:20'),
        arrivalTime: new Date('2025-01-03 11:30'),
        onBlockTime: new Date('2025-01-03 11:45'),
      },
    } as Prisma.InputJsonValue,
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 1,
          cabinCrew: 12,
        },
        passengers: 335,
        payload: 34.9,
        cargo: 8.4,
        zeroFuelWeight: 162.3,
        blockFuel: 47.9,
      },
      final: null,
    } as Prisma.InputJsonValue & Loadsheets,
  };

  const departureAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' }, // New York JFK
  });

  const arrivalAirport = await prisma.airport.findFirstOrThrow({
    where: { id: 'f35c094a-bec5-4803-be32-bd80a14b441a' }, // Frankfurt
  });

  const alternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf' }, // Bremen
  });

  const etopsAlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a' }, // Reykjavik
  });

  const etops2AlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '6cf1fcd8-d072-46b5-8132-bd885b43dd97' }, // St. John's
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

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etopsAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etops2AlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });

  await prisma.user.update({
    where: { id: '629be07f-5e65-429a-9d69-d34b99185f50' }, // Michael Doe user
    data: {
      currentFlightId: flight.id,
      currentRotationId: 'c2e12afb-a712-45aa-9ba5-fec71868e59a',
    },
  });

  await prisma.flightEvent.createMany({
    data: [
      {
        id: '865a28a4-5154-4e35-a6d4-e198a1ceaa31',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasCreated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:00'),
      },
      {
        id: '2b2cecc3-6af9-4335-9029-873c6da142c5',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.PreliminaryLoadsheetWasUpdated,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:05'),
      },
      {
        id: '8505951b-9fdd-4262-8460-248039f8e7cd',
        // Alice Doe, Operations
        actorId: '721ab705-8608-4386-86b4-2f391a3655a7',
        flightId: flight.id,
        type: FlightEventType.FlightWasReleased,
        scope: FlightEventScope.operations,
        createdAt: new Date('2025-01-01 11:10'),
      },
      {
        id: 'c8f5dd49-03f7-4656-8976-8907175c0017',
        // Michael Doe, Cabin Crew
        actorId: '629be07f-5e65-429a-9d69-d34b99185f50',
        flightId: flight.id,
        type: FlightEventType.PilotCheckedIn,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:00'),
      },
      {
        id: 'eaf13533-5aef-4451-aeea-82152deda67d',
        // Michael Doe, Cabin Crew
        actorId: '629be07f-5e65-429a-9d69-d34b99185f50',
        flightId: flight.id,
        type: FlightEventType.BoardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 12:40'),
      },
      {
        id: '7d337c5c-6a9b-4d6c-bd87-319706ea55d4',
        // Michael Doe, Cabin Crew
        actorId: '629be07f-5e65-429a-9d69-d34b99185f50',
        flightId: flight.id,
        type: FlightEventType.BoardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:05'),
      },
      {
        id: '30e6a5bb-8945-44ca-b6dc-537155c24287',
        // Michael Doe, Cabin Crew
        actorId: '629be07f-5e65-429a-9d69-d34b99185f50',
        flightId: flight.id,
        type: FlightEventType.OffBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:10'),
      },
      {
        id: '0c1703d9-af9b-49f7-9a7a-26ff6cd53e36',
        // Michael Doe, Cabin Crew
        actorId: '629be07f-5e65-429a-9d69-d34b99185f50',
        flightId: flight.id,
        type: FlightEventType.TakeoffWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 13:25'),
      },
      {
        id: '8fa22b88-71db-40c9-90ed-0525d35c4af2',
        // Michael Doe, Cabin Crew
        actorId: '629be07f-5e65-429a-9d69-d34b99185f50',
        flightId: flight.id,
        type: FlightEventType.ArrivalWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:10'),
      },
      {
        id: '9fb04dc3-062b-4f68-a2f3-a35a5e76e272',
        // Michael Doe, Cabin Crew
        actorId: '629be07f-5e65-429a-9d69-d34b99185f50',
        flightId: flight.id,
        type: FlightEventType.OnBlockWasReported,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:28'),
      },
      {
        id: 'bd5ae37a-2efe-4ca9-83c9-6ed6e9218fad',
        // Michael Doe, Cabin Crew
        actorId: '629be07f-5e65-429a-9d69-d34b99185f50',
        flightId: flight.id,
        type: FlightEventType.OffboardingWasStarted,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:30'),
      },
      {
        id: '6391d61d-988a-43c2-abd0-49a9f6aa25a5',
        // Michael Doe, Cabin Crew
        actorId: '629be07f-5e65-429a-9d69-d34b99185f50',
        flightId: flight.id,
        type: FlightEventType.OffboardingWasFinished,
        scope: FlightEventScope.user,
        createdAt: new Date('2025-01-01 16:50'),
      },
    ],
  });
}

/**
 * DLH 102 | 1e9f4176-188f-41a5-a9d1-25a96579f46d
 * New York JFK (KJFK) -> Boston Frankfurt (EDDF)
 * status: In cruise - DIVERSION TO KJFK
 */
async function loadDLH102(): Promise<void> {
  const data = {
    id: '1e9f4176-188f-41a5-a9d1-25a96579f46d',
    flightNumber: 'LH 102',
    callsign: 'DLH 102',
    status: FlightStatus.InCruise,
    aircraftId: '9f5da1a4-f09e-4961-8299-82d688337d1f', // A330
    operatorId: '40b1b34e-aea1-4cec-acbe-f2bf97c06d7d', // Lufthansa,
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
    loadsheets: {
      preliminary: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 1,
          cabinCrew: 12,
        },
        passengers: 335,
        payload: 34.9,
        cargo: 8.4,
        zeroFuelWeight: 162.3,
        blockFuel: 47.9,
      },
      final: {
        flightCrew: {
          pilots: 2,
          reliefPilots: 1,
          cabinCrew: 12,
        },
        passengers: 335,
        payload: 34.9,
        cargo: 8.4,
        zeroFuelWeight: 162.3,
        blockFuel: 47.9,
      },
    } as Prisma.InputJsonValue & Loadsheets,
  };

  const departureAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '3c721cc6-c653-4fad-be43-dc9d6a149383' }, // New York JFK
  });

  const arrivalAirport = await prisma.airport.findFirstOrThrow({
    where: { id: 'f35c094a-bec5-4803-be32-bd80a14b441a' }, // Frankfurt
  });

  const alternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf' }, // Bremen
  });

  const etopsAlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '523b2d2f-9b60-405a-bd5a-90eed1b58e9a' }, // Reykjavik
  });

  const etops2AlternateAirport = await prisma.airport.findFirstOrThrow({
    where: { id: '6cf1fcd8-d072-46b5-8132-bd885b43dd97' }, // St. John's
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

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etopsAlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });

  await prisma.airportsOnFlights.create({
    data: {
      airport: { connect: { id: etops2AlternateAirport.id } },
      flight: { connect: { id: flight.id } },
      airportType: AirportType.EtopsAlternate,
    },
  });

  await prisma.diversion.create({
    data: {
      id: '7c1482ce-dc03-4401-8472-0c25eef35de9',
      flightId: flight.id,
      airportId: departureAirport.id, // Diverted to JFK
      reason: DiversionReason.Medical,
      severity: DiversionSeverity.Emergency,
      reportedBy: 'e181d983-3b69-4be2-864e-2a7596217ddf', // John Doe, cabin-crew
      reporterRole: DiversionReporterRole.Crew,
      position: { latitude: 52.520008, longitude: 13.404954 },
      notifySecurityOnGround: false,
      notifyFirefightersOnGround: false,
      notifyMedicalOnGround: true,
      decisionTime: new Date('2025-01-01 14:25'),
      estimatedTimeAtDestination: new Date('2025-01-01 15:25'),
    },
  });
}

export async function loadFlights(): Promise<void> {
  await loadDLH450();
  await loadAAL4905();
  await loadAAL4906();
  await loadAAL4907();
  await loadAAL4908();
  await loadAAL4909();
  await loadAAL4910();
  await loadAAL4911();
  await loadAAL4912();
  await loadAAL4913();
  await loadAAL4914();
  await loadAAL4915();
  await loadAAL4916();
  await loadAAL4917();
  await loadDLH40();
  await loadDLH41();
  await loadDLH42();
  await loadDLH43();
  await loadDLH102();
}
