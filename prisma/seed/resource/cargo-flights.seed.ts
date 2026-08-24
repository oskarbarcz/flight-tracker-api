import { Prisma } from '../../client/client';
import {
  FlightServiceType,
  FlightStatus,
  FlightTracking,
} from '../../../src/modules/flights/model/flight.model';
import { AirportType } from '../../../src/modules/airports/model/airport.model';
import { AircraftState } from '../../../src/modules/aircraft/model/aircraft.model';
import { Loadsheet } from '../../../src/modules/flights/model/loadsheet.model';

const AMERICAN = '1f630d38-ad24-47cc-950b-3783e71bbd10';
const AIR_FRANCE = '3a1354c5-d9fb-428b-9f87-0e887e491f0d';
const KLM = '7d724b05-8eb9-4e66-84cc-bb101369d1a0';
const CARGOLUX = 'ae07aa28-8bac-4cd7-91fc-12c76e1b6807';

const N78881 = 'a10c21e3-3ac1-4265-9d12-da9baefa2d98';
const F_GKXA = '54ae8e50-8712-40be-b4af-d22633b0956f';
const PH_BXA = '5f8902a2-f2b2-46e9-8630-365f78ee6ff3';
const LX_VCA = 'b2f5c1d4-9e3a-4c77-8a61-5d0f2b7e9c44';
const N801AN = 'd7e41a08-6c52-4b93-9f18-3a6c8e0d5b71';

const OPERATIONS = '721ab705-8608-4386-86b4-2f391a3655a7';
const RICK = 'fcf6f4bc-290d-43a9-843c-409cd47e143d';

const EDDF = 'f35c094a-bec5-4803-be32-bd80a14b441a';
const LFPG = '79b8f884-f67d-4585-b540-36b0be7f551e';
const KJFK = '3c721cc6-c653-4fad-be43-dc9d6a149383';
const KPHL = 'e764251b-bb25-4e8b-8cc7-11b0397b4554';
const EPWA = '616cbdd7-ccfc-4687-8cf6-1e7236435046';
const BIKF = '523b2d2f-9b60-405a-bd5a-90eed1b58e9a';

const NEW_AIRCRAFT = [
  {
    id: LX_VCA,
    type: 'B74F',
    registration: 'LX-VCA',
    selcal: 'CV-CA',
    livery: 'Cargolux (2019)',
    cabinLayout: null,
    holdVariant: 'b74f-nose',
    operatorId: CARGOLUX,
    baseAirportId: EDDF,
  },
  {
    id: N801AN,
    type: 'B788',
    registration: 'N801AN',
    selcal: 'AA-BN',
    livery: 'American Airlines (2013)',
    cabinLayout: null,
    holdVariant: null,
    operatorId: AMERICAN,
    baseAirportId: KPHL,
  },
];

type CargoFlightSpec = {
  id: string;
  flightNumber: string;
  callsign: string;
  operatorId: string;
  aircraftId: string;
  captainId: string | null;
  status: FlightStatus;
  serviceType: FlightServiceType;
  departureAirportId: string;
  destinationAirportId: string;
  alternateAirportId: string;
  cargo: number;
  passengers?: number;
  passengersByCabin?: Record<string, number>;
};

const FLIGHTS: CargoFlightSpec[] = [
  {
    id: '1b6f4c9a-2d78-4e51-9a03-7c8e5f1b2d64',
    flightNumber: 'AA2010',
    callsign: 'AAL2010',
    operatorId: AMERICAN,
    aircraftId: N78881,
    captainId: null,
    status: FlightStatus.Created,
    serviceType: FlightServiceType.Passenger,
    departureAirportId: KJFK,
    destinationAirportId: EDDF,
    alternateAirportId: KPHL,
    cargo: 18,
  },
  {
    id: '2c7a5d0b-3e89-4f62-8b14-6d9f0a2c3e75',
    flightNumber: 'AF2011',
    callsign: 'AFR2011',
    operatorId: AIR_FRANCE,
    aircraftId: F_GKXA,
    captainId: null,
    status: FlightStatus.Created,
    serviceType: FlightServiceType.Passenger,
    departureAirportId: LFPG,
    destinationAirportId: EDDF,
    alternateAirportId: EPWA,
    cargo: 2.5,
  },
  {
    id: '3d8b6e1c-4f90-4a73-9c25-7e0a1b3d4f86',
    flightNumber: 'KL2012',
    callsign: 'KLM2012',
    operatorId: KLM,
    aircraftId: PH_BXA,
    captainId: null,
    status: FlightStatus.Created,
    serviceType: FlightServiceType.Passenger,
    departureAirportId: EDDF,
    destinationAirportId: EPWA,
    alternateAirportId: LFPG,
    cargo: 1.8,
  },
  {
    id: '4e9c7f2d-5a01-4b84-8d36-8f1b2c4e5a97',
    flightNumber: 'CV2013',
    callsign: 'CLX2013',
    operatorId: CARGOLUX,
    aircraftId: LX_VCA,
    captainId: null,
    status: FlightStatus.Created,
    serviceType: FlightServiceType.Cargo,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    cargo: 62,
  },
  {
    id: '5f0d8a3e-6b12-4c95-9e47-9a2c3d5f6b08',
    flightNumber: 'AA2014',
    callsign: 'AAL2014',
    operatorId: AMERICAN,
    aircraftId: N801AN,
    captainId: null,
    status: FlightStatus.Created,
    serviceType: FlightServiceType.Passenger,
    departureAirportId: KPHL,
    destinationAirportId: EDDF,
    alternateAirportId: BIKF,
    cargo: 8,
  },
  {
    id: '8c3a1d61-9e45-4fc8-8b7a-2d5f6a8c9e3b',
    flightNumber: 'AF2017',
    callsign: 'AFR2017',
    operatorId: AIR_FRANCE,
    aircraftId: F_GKXA,
    captainId: null,
    status: FlightStatus.Created,
    serviceType: FlightServiceType.Passenger,
    departureAirportId: LFPG,
    destinationAirportId: EDDF,
    alternateAirportId: EPWA,
    cargo: 2.5,
    passengers: 150,
    passengersByCabin: { business: 20, economy: 130 },
  },
  {
    id: '7b2f0c50-8d34-4eb7-9a69-1c4e5f7b8d2a',
    flightNumber: 'KL2016',
    callsign: 'KLM2016',
    operatorId: KLM,
    aircraftId: PH_BXA,
    captainId: null,
    status: FlightStatus.Created,
    serviceType: FlightServiceType.Passenger,
    departureAirportId: EDDF,
    destinationAirportId: EPWA,
    alternateAirportId: LFPG,
    cargo: 10,
  },
  {
    id: '6a1e9b4f-7c23-4da6-8f58-0b3d4e6a7c19',
    flightNumber: 'CV2015',
    callsign: 'CLX2015',
    operatorId: CARGOLUX,
    aircraftId: LX_VCA,
    captainId: RICK,
    status: FlightStatus.CheckedIn,
    serviceType: FlightServiceType.Cargo,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    cargo: 40,
  },
  {
    id: 'd2601432-e8cb-4018-8cee-f24aaaa29ca5',
    flightNumber: 'AA2018',
    callsign: 'AAL2018',
    operatorId: AMERICAN,
    aircraftId: N78881,
    captainId: RICK,
    status: FlightStatus.BoardingStarted,
    serviceType: FlightServiceType.Cargo,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    cargo: 5.5,
  },
  {
    id: 'dc20c7ff-114e-42be-86cc-34fd90b71b35',
    flightNumber: 'AA2019',
    callsign: 'AAL2019',
    operatorId: AMERICAN,
    aircraftId: N801AN,
    captainId: RICK,
    status: FlightStatus.BoardingStarted,
    serviceType: FlightServiceType.Cargo,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    cargo: 3,
  },
  {
    id: '2fbd8bb1-6d47-4e35-9f0a-5c2e17a4d380',
    flightNumber: 'CV2020',
    callsign: 'CLX2020',
    operatorId: CARGOLUX,
    aircraftId: LX_VCA,
    captainId: RICK,
    status: FlightStatus.Ready,
    serviceType: FlightServiceType.Cargo,
    departureAirportId: EDDF,
    destinationAirportId: KJFK,
    alternateAirportId: KPHL,
    cargo: 14.9,
  },
];

export async function loadCargoFlights(
  tx: Prisma.TransactionClient,
): Promise<void> {
  for (const aircraft of NEW_AIRCRAFT) {
    await tx.aircraft.create({
      data: {
        ...aircraft,
        currentState: AircraftState.Idle,
        etopsThresholdMinutes: null,
        lastAirportId: aircraft.baseAirportId,
        lastAirportUpdatedAt: null,
        lastParkingPositionId: null,
      },
    });
  }

  for (const spec of FLIGHTS) {
    await tx.flight.create({
      data: {
        id: spec.id,
        flightNumber: spec.flightNumber,
        callsign: spec.callsign,
        atcCallsign: null,
        status: spec.status,
        serviceType: spec.serviceType,
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

const STANDARD_PASSENGER_TONNES = 0.084;
const STANDARD_BAG_TONNES = 0.016;

function loadsheetFor(spec: CargoFlightSpec): Loadsheet {
  const passengers = spec.passengers ?? 0;
  const payload =
    spec.cargo + passengers * (STANDARD_PASSENGER_TONNES + STANDARD_BAG_TONNES);

  return {
    flightCrew: {
      pilots: 2,
      reliefPilots: 0,
      cabinCrew: passengers > 0 ? 4 : 0,
    },
    passengers,
    passengersByCabin: spec.passengersByCabin ?? null,
    cargo: spec.cargo,
    payload: Math.round(payload * 1000) / 1000,
    zeroFuelWeight: Math.round((68.4 + payload) * 1000) / 1000,
    blockFuel: 21.4,
    fuel: null,
  };
}

function timesheetFor(status: FlightStatus) {
  const scheduled = {
    offBlockTime: new Date('2025-06-02 09:00'),
    takeoffTime: new Date('2025-06-02 09:20'),
    arrivalTime: new Date('2025-06-02 17:40'),
    onBlockTime: new Date('2025-06-02 17:50'),
  };

  if (status === FlightStatus.Created) {
    return { scheduled };
  }

  return {
    scheduled,
    estimated: {
      offBlockTime: new Date('2025-06-02 09:05'),
      takeoffTime: new Date('2025-06-02 09:25'),
      arrivalTime: new Date('2025-06-02 17:35'),
      onBlockTime: new Date('2025-06-02 17:45'),
    },
  };
}
