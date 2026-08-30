import { Prisma } from '../../client/client';
import {
  FlightLoadsheet,
  Loadsheet,
  LoadsheetKind,
} from '../../../src/modules/flights/model/loadsheet.model';
import {
  LoadsheetRow,
  toFlightLoadsheet,
} from '../../../src/modules/flights/model/loadsheet.mapper';

export const SEEDED_LOADSHEET_ISSUED_AT = new Date('2025-01-01 00:00');

type SeededLoadsheets = {
  preliminary?: Loadsheet | Loadsheet[] | null;
  final?: Loadsheet | null;
  issuedById?: string | null;
  issuedAt?: Date;
};

function toRow(
  loadsheet: Loadsheet,
  kind: 'preliminary' | 'final',
  revision: number,
  issuedById: string | null,
  issuedAt: Date,
): Prisma.FlightLoadsheetCreateWithoutFlightInput {
  return {
    kind,
    revision,
    issuedBy: issuedById ? { connect: { id: issuedById } } : undefined,
    issuedAt,
    pilots: loadsheet.flightCrew.pilots,
    reliefPilots: loadsheet.flightCrew.reliefPilots,
    cabinCrew: loadsheet.flightCrew.cabinCrew,
    passengers: loadsheet.passengers,
    firstPassengers: loadsheet.passengersByCabin?.first ?? null,
    businessPassengers: loadsheet.passengersByCabin?.business ?? null,
    premiumEconomyPassengers:
      loadsheet.passengersByCabin?.premium_economy ?? null,
    economyPassengers: loadsheet.passengersByCabin?.economy ?? null,
    passengerMass: loadsheet.passengerMass ?? null,
    cargo: loadsheet.cargo,
    payload: loadsheet.payload,
    zeroFuelWeight: loadsheet.zeroFuelWeight,
    blockFuel: loadsheet.blockFuel,
    fuelBlock: loadsheet.fuel?.block ?? null,
    fuelTaxi: loadsheet.fuel?.taxi ?? null,
    fuelTrip: loadsheet.fuel?.trip ?? null,
    fuelAlternate: loadsheet.fuel?.alternate ?? null,
    fuelReserve: loadsheet.fuel?.reserve ?? null,
    fuelContingencyType: loadsheet.fuel?.contingencyType ?? null,
    fuelContingencyAmount: loadsheet.fuel?.contingencyAmount ?? null,
    fuelMel: loadsheet.fuel?.mel ?? null,
    fuelAtc: loadsheet.fuel?.atc ?? null,
    fuelWxx: loadsheet.fuel?.wxx ?? null,
    fuelExtra: loadsheet.fuel?.extra ?? null,
    fuelTankering: loadsheet.fuel?.tankering ?? null,
    fuelEtops: loadsheet.fuel?.etops ?? null,
    fuelMinTakeoff: loadsheet.fuel?.minTakeoff ?? null,
    fuelPlanTakeoff: loadsheet.fuel?.planTakeoff ?? null,
    fuelPlanLanding: loadsheet.fuel?.planLanding ?? null,
    fuelAverageFlow: loadsheet.fuel?.averageFuelFlow ?? null,
    fuelMaxTanks: loadsheet.fuel?.maxTanks ?? null,
  };
}

export function seedLoadsheets(
  loadsheets: SeededLoadsheets,
): Prisma.FlightLoadsheetCreateNestedManyWithoutFlightInput {
  const issuedById = loadsheets.issuedById ?? null;
  const issuedAt = loadsheets.issuedAt ?? SEEDED_LOADSHEET_ISSUED_AT;
  const preliminary = loadsheets.preliminary ?? [];
  const revisions = Array.isArray(preliminary) ? preliminary : [preliminary];

  const rows = revisions.map((loadsheet, index) =>
    toRow(loadsheet, 'preliminary', index + 1, issuedById, issuedAt),
  );

  if (loadsheets.final) {
    rows.push(toRow(loadsheets.final, 'final', 1, issuedById, issuedAt));
  }

  return { create: rows };
}

export function currentLoadsheet(
  rows: LoadsheetRow[],
  kind: LoadsheetKind,
): FlightLoadsheet | null {
  const ofKind = rows
    .filter((row) => row.kind === kind)
    .sort((left, right) => right.revision - left.revision);

  return ofKind.length === 0 ? null : toFlightLoadsheet(ofKind[0]);
}
