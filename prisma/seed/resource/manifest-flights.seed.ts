import { Prisma } from '../../client/client';
import {
  FlightStatus,
  FlightTracking,
} from '../../../src/modules/flights/model/flight.model';
import { AirportType } from '../../../src/modules/airports/model/airport.model';
import { Loadsheet } from '../../../src/modules/flights/model/loadsheet.model';

const CONDOR = '5c649579-22eb-4c07-a96c-b74a77f53871';
const AIR_FRANCE = '3a1354c5-d9fb-428b-9f87-0e887e491f0d';
const D_AIDA = '7d27a031-5abb-415f-bde5-1aa563ad394e';
const F_GKXA = '54ae8e50-8712-40be-b4af-d22633b0956f';
const RICK = 'fcf6f4bc-290d-43a9-843c-409cd47e143d';
const OPERATIONS = '721ab705-8608-4386-86b4-2f391a3655a7';
const EDDF = 'f35c094a-bec5-4803-be32-bd80a14b441a';
const LFPG = '79b8f884-f67d-4585-b540-36b0be7f551e';
const KJFK = '3c721cc6-c653-4fad-be43-dc9d6a149383';
const KPHL = 'e764251b-bb25-4e8b-8cc7-11b0397b4554';

type ManifestFlightSpec = {
  id: string;
  flightNumber: string;
  callsign: string;
  status: FlightStatus;
  operatorId: string;
  aircraftId: string;
  captainId: string | null;
  departureAirportId: string;
  destinationAirportId: string;
  alternateAirportId: string;
  passengers: number;
  passengersByCabin?: Record<string, number>;
};

const FLIGHTS: ManifestFlightSpec[] = [
  {
    id: 'a5fffa17-7803-4e85-8291-d1dc9276bd46',
    flightNumber: 'DE1010',
    callsign: 'CFG1010',
    status: FlightStatus.Created,
    operatorId: CONDOR,
    aircraftId: D_AIDA,
    captainId: null,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    passengers: 150,
  },
  {
    id: 'c9c526f4-7b97-4454-b1e4-28b5ea57851f',
    flightNumber: 'DE1011',
    callsign: 'CFG1011',
    status: FlightStatus.Created,
    operatorId: CONDOR,
    aircraftId: D_AIDA,
    captainId: null,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    passengers: 220,
  },
  {
    id: '56999cc9-b26d-4f3b-a51e-2b175809b0cd',
    flightNumber: 'DE1012',
    callsign: 'CFG1012',
    status: FlightStatus.Created,
    operatorId: CONDOR,
    aircraftId: D_AIDA,
    captainId: null,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    passengers: 221,
  },
  {
    id: '8e5f9f40-34f3-4813-99db-b732ba2b815e',
    flightNumber: 'DE1013',
    callsign: 'CFG1013',
    status: FlightStatus.Created,
    operatorId: CONDOR,
    aircraftId: D_AIDA,
    captainId: null,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    passengers: 150,
    passengersByCabin: { business: 30, economy: 120 },
  },
  {
    id: 'a7cd765c-8dcf-40b6-99a5-dae4a5c974b6',
    flightNumber: 'DE1014',
    callsign: 'CFG1014',
    status: FlightStatus.CheckedIn,
    operatorId: CONDOR,
    aircraftId: D_AIDA,
    captainId: RICK,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    passengers: 150,
  },
  {
    id: '92abe9b3-0986-4dc2-9d93-50eadaa73e70',
    flightNumber: 'DE1015',
    callsign: 'CFG1015',
    status: FlightStatus.BoardingStarted,
    operatorId: CONDOR,
    aircraftId: D_AIDA,
    captainId: RICK,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    passengers: 150,
  },
  {
    id: 'e847e79d-5ce7-4f54-9270-74f8fa4a57ea',
    flightNumber: 'AF1019',
    callsign: 'AFR1019',
    status: FlightStatus.BoardingStarted,
    operatorId: AIR_FRANCE,
    aircraftId: F_GKXA,
    captainId: RICK,
    departureAirportId: LFPG,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    passengers: 150,
  },
];

export async function loadManifestFlights(
  tx: Prisma.TransactionClient,
): Promise<void> {
  for (const spec of FLIGHTS) {
    await tx.flight.create({
      data: {
        id: spec.id,
        flightNumber: spec.flightNumber,
        callsign: spec.callsign,
        atcCallsign: null,
        status: spec.status,
        operatorId: spec.operatorId,
        aircraftId: spec.aircraftId,
        captainId: spec.captainId,
        createdById: OPERATIONS,
        tracking: FlightTracking.Private,
        isEtops: false,
        greatCircleDistance: 6200,
        totalFuelBurned: 21400,
        createdAt: new Date('2025-01-01 00:00'),
        timesheet: timesheetFor(spec.status) as Prisma.InputJsonValue,
        loadsheets: {
          preliminary: loadsheetFor(spec),
          final: null,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    for (const [airportId, airportType] of [
      [spec.departureAirportId, AirportType.Departure],
      [spec.destinationAirportId, AirportType.Destination],
      [spec.alternateAirportId, AirportType.DestinationAlternate],
    ] as const) {
      await tx.airportsOnFlights.create({
        data: { flightId: spec.id, airportId, airportType },
      });
    }
  }
}

function loadsheetFor(spec: ManifestFlightSpec): Loadsheet {
  return {
    flightCrew: { pilots: 2, reliefPilots: 0, cabinCrew: 5 },
    passengers: spec.passengers,
    passengersByCabin: spec.passengersByCabin ?? null,
    cargo: 4.2,
    payload: 19.8,
    zeroFuelWeight: 68.4,
    blockFuel: 21.4,
    fuel: null,
  };
}

function timesheetFor(status: FlightStatus) {
  const scheduled = {
    offBlockTime: new Date('2025-01-02 09:00'),
    takeoffTime: new Date('2025-01-02 09:20'),
    arrivalTime: new Date('2025-01-02 17:40'),
    onBlockTime: new Date('2025-01-02 17:50'),
  };

  if (status === FlightStatus.Created) {
    return { scheduled };
  }

  return {
    scheduled,
    estimated: {
      offBlockTime: new Date('2025-01-02 09:05'),
      takeoffTime: new Date('2025-01-02 09:25'),
      arrivalTime: new Date('2025-01-02 17:35'),
      onBlockTime: new Date('2025-01-02 17:45'),
    },
  };
}
