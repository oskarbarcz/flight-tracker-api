import {
  NotocStage,
  Prisma,
  WeatherInformationType,
} from '../../client/client';
import {
  Loadsheet,
  Loadsheets,
} from '../../../src/modules/flights/model/loadsheet.model';
import { Continent } from '../../../src/modules/airports/model/airport.model';
import { AirportType } from '../../../src/modules/airports/model/airport.model';
import { offeredCommodities } from '../../../src/modules/manifest/model/commodity-selection';
import { offeredCommoditiesFor } from '../../../src/modules/manifest/model/cargo-aircraft-only.policy';
import {
  ambientFromMetar,
  upgradeOfferedSolutions,
} from '../../../src/modules/manifest/model/cold-chain';
import {
  ColdChainContext,
  CompartmentUsage,
  looseSlotsOf,
  MAX_DANGEROUS_GOODS_PER_FLIGHT,
  planBaggageUnits,
  planCargoLoad,
  slotsOf,
} from '../../../src/modules/manifest/model/cargo-packing';
import { planBaggage } from '../../../src/modules/manifest/model/baggage';
import { awbPrefixFor } from '../../../src/modules/manifest/model/awb';
import {
  CargoAirport,
  JourneyContext,
} from '../../../src/modules/manifest/model/shipment-journey';
import { tradePartyFactory } from '../../../src/modules/manifest/model/trade-party';
import { toNewCargoUnit } from '../../../src/modules/manifest/model/cargo-unit-write';
import { resolvePassengerLocale } from '../../../src/modules/manifest/model/passenger-name';
import { resolveHoldVariant } from '../../../src/modules/manifest/model/hold-variant-resolution';
import { composeFlightCargoManifest } from '../../../src/modules/manifest/model/cargo-manifest.read';
import { composeNotoc } from '../../../src/modules/manifest/model/notoc';

const DELIBERATELY_UNPLACEABLE = ['KL2016', 'AF2019'];
const BUILD_UP_HOURS = 3;
const DEFAULT_FLIGHT_HOURS = 2;

function seededRandom(seed: string): () => number {
  let state = 0;

  for (const character of seed) {
    state = (state * 31 + character.charCodeAt(0)) % 2147483647;
  }

  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function flightHoursOf(timesheet: unknown): number {
  const scheduled = (
    timesheet as {
      scheduled?: { takeoffTime?: string; arrivalTime?: string };
    }
  )?.scheduled;

  if (!scheduled?.takeoffTime || !scheduled?.arrivalTime) {
    return DEFAULT_FLIGHT_HOURS;
  }

  const hours =
    (new Date(scheduled.arrivalTime).getTime() -
      new Date(scheduled.takeoffTime).getTime()) /
    3600000;

  return hours > 0 ? hours : DEFAULT_FLIGHT_HOURS;
}

function departureAtOf(timesheet: unknown): Date {
  const offBlock = (timesheet as { scheduled?: { offBlockTime?: string } })
    ?.scheduled?.offBlockTime;

  return offBlock ? new Date(offBlock) : new Date('2025-01-01');
}

export async function loadGeneratedManifests(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const [flights, alreadyLoaded, notocIssued, airports, operators] =
    await Promise.all([
      tx.flight.findMany({
        include: {
          aircraft: true,
          operator: true,
          airports: { include: { airport: true } },
        },
      }),
      tx.flightCargoUnit.findMany({ select: { flightId: true } }),
      tx.flightNotoc.findMany({ select: { flightId: true } }),
      tx.airport.findMany({ select: { iataCode: true, continent: true } }),
      tx.operator.findMany({ select: { iataCode: true } }),
    ]);

  const unplaceable: string[] = [];
  const refused = new Set<string>();
  const loaded = new Set(alreadyLoaded.map((row) => row.flightId));
  const documented = new Set(notocIssued.map((row) => row.flightId));

  for (const flight of flights) {
    const preliminary = (flight.loadsheets as unknown as Loadsheets)
      ?.preliminary;

    if (!preliminary || loaded.has(flight.id)) {
      continue;
    }

    const departure = flight.airports.find(
      (entry) => entry.airportType === AirportType.Departure,
    )?.airport;
    const arrival = flight.airports.find(
      (entry) => entry.airportType === AirportType.Destination,
    )?.airport;

    if (!departure || !arrival) {
      continue;
    }

    let units;

    try {
      units = await plannedUnitsFor(
        tx,
        flight,
        preliminary,
        { departure, arrival },
        airports,
        operators.map((operator) => operator.iataCode),
      );
    } catch (error) {
      refused.add(flight.id);

      if (!DELIBERATELY_UNPLACEABLE.includes(flight.flightNumber)) {
        unplaceable.push(
          `${flight.flightNumber} ${flight.aircraft.type} cargo=${preliminary.cargo}t pax=${preliminary.passengers} payload=${preliminary.payload}t :: ${(error as Error).message}`,
        );
      }

      continue;
    }

    for (const unit of units) {
      const { shipments, ...fields } = unit;

      await tx.flightCargoUnit.create({
        data: {
          ...fields,
          flightId: flight.id,
          shipments: {
            create: shipments.map((shipment) => ({
              ...shipment,
              flightId: flight.id,
            })),
          },
        },
      });
    }
  }

  for (const flight of flights) {
    const preliminary = (flight.loadsheets as unknown as Loadsheets)
      ?.preliminary;
    const arrival = flight.airports.find(
      (entry) => entry.airportType === AirportType.Destination,
    )?.airport;

    if (
      !preliminary ||
      !arrival ||
      documented.has(flight.id) ||
      refused.has(flight.id)
    ) {
      continue;
    }

    const rows = await tx.flightCargoUnit.findMany({
      where: { flightId: flight.id },
      include: { shipments: true },
    });

    const variant = resolveHoldVariant(
      flight.aircraft.type,
      flight.aircraft.holdVariant,
    );

    await tx.flightNotoc.create({
      data: {
        flightId: flight.id,
        stage: NotocStage.preliminary,
        issuedAt: departureAtOf(flight.timesheet),
        document: composeNotoc(
          composeFlightCargoManifest(flight.id, rows, variant),
          arrival.iataCode,
        ) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  if (unplaceable.length > 0) {
    throw new Error(
      'seeded loadsheets whose load cannot be placed:\n  ' +
        unplaceable.join('\n  '),
    );
  }
}

type SeededFlight = {
  id: string;
  flightNumber: string;
  timesheet: Prisma.JsonValue;
  greatCircleDistance: number;
  aircraft: { id: string; type: string; holdVariant: string | null };
  operator: { id: string; iataCode: string };
};

type Endpoints = {
  departure: { iataCode: string; country: string; continent: string };
  arrival: { iataCode: string; country: string; continent: string };
};

async function plannedUnitsFor(
  tx: Prisma.TransactionClient,
  flight: SeededFlight,
  loadsheet: Loadsheet,
  endpoints: Endpoints,
  airports: { iataCode: string; continent: string }[],
  carrierCodes: string[],
) {
  const { departure, arrival } = endpoints;
  const random = seededRandom(flight.id);
  const flightHours = flightHoursOf(flight.timesheet);

  const weather = await tx.airportWeather.findFirst({
    where: {
      airport: { iataCode: arrival.iataCode },
      informationType: WeatherInformationType.metar,
    },
    orderBy: { lastFetched: 'desc' },
  });

  const coldChain: ColdChainContext = {
    buildUpHours: BUILD_UP_HOURS,
    flightHours,
    ambientC: ambientFromMetar(weather?.content ?? null),
  };

  const offered = upgradeOfferedSolutions(
    offeredCommoditiesFor(
      offeredCommodities({
        iataCode: departure.iataCode,
        country: departure.country,
        continent: departure.continent as Continent,
        month: departureAtOf(flight.timesheet).getUTCMonth() + 1,
      }),
      loadsheet.passengers,
    ),
    coldChain.buildUpHours + coldChain.flightHours,
  );

  const journey: JourneyContext = {
    leg: { departure: departure.iataCode, arrival: arrival.iataCode },
    departureContinent: departure.continent as Continent,
    arrivalContinent: arrival.continent as Continent,
    candidates: airports.filter(
      (airport) =>
        airport.iataCode !== departure.iataCode &&
        airport.iataCode !== arrival.iataCode,
    ) as CargoAirport[],
    carriers: carrierCodes.filter((code) => code !== flight.operator.iataCode),
    random,
  };

  const variant = resolveHoldVariant(
    flight.aircraft.type,
    flight.aircraft.holdVariant,
  );

  const baggage = planBaggage({
    payloadTons: loadsheet.payload,
    passengers: loadsheet.passengers,
    cargoTons: loadsheet.cargo,
    distanceKm: flight.greatCircleDistance,
    passengersByCabin: loadsheet.passengersByCabin,
  });

  const occupied = new Set<string>();
  const compartmentLoad = new Map<number, CompartmentUsage>();

  const baggageUnits = variant
    ? planBaggageUnits({
        plan: baggage,
        slots: slotsOf(variant),
        looseSlots: looseSlotsOf(variant),
        occupied,
        compartmentLoad,
      })
    : [];

  const cargoUnits = planCargoLoad({
    targetKg: Math.round(loadsheet.cargo * 1000),
    offered,
    slots: variant ? slotsOf(variant) : [],
    looseSlots: variant ? looseSlotsOf(variant) : [],
    journey,
    coldChain,
    random,
    occupied,
    compartmentLoad,
    dangerousGoodsCeiling:
      loadsheet.passengers > 0 ? MAX_DANGEROUS_GOODS_PER_FLIGHT : null,
  });

  const context = {
    operatorIata: flight.operator.iataCode,
    prefix: awbPrefixFor(flight.operator.iataCode),
    parties: tradePartyFactory(
      resolvePassengerLocale(
        departure.country,
        departure.continent as Continent,
      ),
      resolvePassengerLocale(arrival.country, arrival.continent as Continent),
    ),
    carriers: journey.carriers,
    random,
  };

  return [...baggageUnits, ...cargoUnits].map((unit) =>
    toNewCargoUnit(unit, context),
  );
}
