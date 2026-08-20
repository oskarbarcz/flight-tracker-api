import { FlightPassengerStatus, Prisma } from '../../client/client';
import { FlightStatus } from '../../../src/modules/flights/model/flight.model';
import { Loadsheets } from '../../../src/modules/flights/model/loadsheet.model';
import {
  AllocatableSeat,
  allocateSeats,
  assignPnrs,
  cabinSizesOf,
  planReconciliation,
  SeatedPassenger,
  targetPerCabin,
} from '../../../src/modules/passengers/model/manifest-generation';
import { PassengerStatus } from '../../../src/modules/passengers/model/manifest.model';
import { passengerNameFactory } from '../../../src/modules/passengers/model/passenger-name';
import { resolvePassengerLocale } from '../../../src/modules/passengers/model/passenger-name';
import { CabinDeckName } from '../../../src/modules/cabin-layouts/model/layout-version';
import { Continent } from '../../../src/modules/airports/model/airport.model';
import { assembledLayout } from './cabin-layout-versions.seed';

export async function loadFlightManifests(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const flights = await tx.flight.findMany({
    where: {
      status: { not: FlightStatus.Created },
      aircraft: { cabinLayout: { not: null } },
    },
    select: {
      id: true,
      operatorId: true,
      loadsheets: true,
      aircraft: { select: { cabinLayout: true } },
    },
    orderBy: { flightNumber: 'asc' },
  });

  const locales = new Map<string, string>();

  for (const flight of flights) {
    const layoutId = flight.aircraft.cabinLayout;
    const { preliminary, final } = flight.loadsheets as unknown as Loadsheets;

    if (!layoutId || !preliminary) {
      continue;
    }

    const seats = seatsOfLayout(layoutId);
    const sizes = cabinSizesOf(seats);
    const released = allocateSeats(
      seats,
      targetPerCabin(
        sizes,
        preliminary.passengers,
        preliminary.passengersByCabin,
      ),
    );

    const locale = await localeFor(tx, flight.operatorId, locales);
    const nextName = passengerNameFactory(locale);
    const pnrs = assignPnrs(released.length);

    const manifest = released.map((seat, index) => ({
      designator: seat.designator,
      deck: seat.deck,
      cabin: seat.cabin,
      name: nextName(),
      pnr: pnrs[index],
      status: FlightPassengerStatus.boarded,
    }));

    if (final) {
      applyBoardingOutcome(
        manifest,
        seats,
        sizes,
        final,
        nextName,
        () => assignPnrs(1)[0],
      );
    }

    await tx.flight.update({
      where: { id: flight.id },
      data: { cabinLayout: layoutId, cabinLayoutRevision: 1 },
    });

    await tx.flightPassenger.createMany({
      data: manifest.map((passenger) => ({
        ...passenger,
        flightId: flight.id,
      })),
    });
  }
}

type ManifestRow = {
  designator: string;
  deck: CabinDeckName;
  cabin: string;
  name: string;
  pnr: string;
  status: FlightPassengerStatus;
};

function applyBoardingOutcome(
  manifest: ManifestRow[],
  seats: AllocatableSeat[],
  sizes: Record<string, number>,
  final: {
    passengers: number;
    passengersByCabin?: Record<string, number> | null;
  },
  nextName: () => string,
  nextPnr: () => string,
): void {
  const seated: SeatedPassenger[] = manifest.map((passenger) => ({
    designator: passenger.designator,
    cabin: passenger.cabin,
    status: PassengerStatus.Boarded,
  }));

  const plan = planReconciliation(
    seats,
    seated,
    targetPerCabin(sizes, final.passengers, final.passengersByCabin),
  );

  for (const designator of plan.noShows) {
    const passenger = manifest.find(
      (candidate) => candidate.designator === designator,
    );

    if (passenger) {
      passenger.status = FlightPassengerStatus.no_show;
    }
  }

  for (const seat of plan.additions) {
    manifest.push({
      designator: seat.designator,
      deck: seat.deck,
      cabin: seat.cabin,
      name: nextName(),
      pnr: nextPnr(),
      status: FlightPassengerStatus.boarded,
    });
  }
}

async function localeFor(
  tx: Prisma.TransactionClient,
  operatorId: string,
  cache: Map<string, string>,
): Promise<string> {
  const cached = cache.get(operatorId);

  if (cached) {
    return cached;
  }

  const operator = await tx.operator.findUniqueOrThrow({
    where: { id: operatorId },
    select: { hubs: true, continent: true },
  });

  const [hub] = operator.hubs as string[];
  const airport = hub
    ? await tx.airport.findUnique({
        where: { iataCode: hub },
        select: { country: true },
      })
    : null;

  const locale = resolvePassengerLocale(
    airport?.country ?? null,
    operator.continent as unknown as Continent,
  );
  cache.set(operatorId, locale);

  return locale;
}

function seatsOfLayout(layoutId: string): AllocatableSeat[] {
  return assembledLayout(layoutId).decks.flatMap((deck) =>
    deck.seats.map((seat) => ({
      designator: seat.designator,
      deck: deck.deck as CabinDeckName,
      cabin: seat.cabin,
    })),
  );
}
