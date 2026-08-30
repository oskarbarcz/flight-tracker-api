import {
  FlightLoadsheet,
  FuelBreakdown,
  LoadsheetKind,
  PassengerCounts,
} from './loadsheet.model';

type DecimalValue = { toNumber(): number };

export const CABIN_COLUMNS = {
  first: 'firstPassengers',
  business: 'businessPassengers',
  premium_economy: 'premiumEconomyPassengers',
  economy: 'economyPassengers',
} as const;

export type CabinName = keyof typeof CABIN_COLUMNS;

export const CABINS = Object.keys(CABIN_COLUMNS) as CabinName[];

export type LoadsheetRow = {
  id: string;
  kind: string;
  revision: number;
  pilots: number;
  reliefPilots: number;
  cabinCrew: number;
  passengers: number;
  firstPassengers: number | null;
  businessPassengers: number | null;
  premiumEconomyPassengers: number | null;
  economyPassengers: number | null;
  passengerMass: DecimalValue | null;
  cargo: DecimalValue;
  payload: DecimalValue;
  zeroFuelWeight: DecimalValue;
  blockFuel: DecimalValue;
  fuelBlock: DecimalValue | null;
  fuelTaxi: DecimalValue | null;
  fuelTrip: DecimalValue | null;
  fuelAlternate: DecimalValue | null;
  fuelReserve: DecimalValue | null;
  fuelContingencyType: string | null;
  fuelContingencyAmount: DecimalValue | null;
  fuelMel: DecimalValue | null;
  fuelAtc: DecimalValue | null;
  fuelWxx: DecimalValue | null;
  fuelExtra: DecimalValue | null;
  fuelTankering: DecimalValue | null;
  fuelEtops: DecimalValue | null;
  fuelMinTakeoff: DecimalValue | null;
  fuelPlanTakeoff: DecimalValue | null;
  fuelPlanLanding: DecimalValue | null;
  fuelAverageFlow: DecimalValue | null;
  fuelMaxTanks: DecimalValue | null;
  issuedById: string | null;
  issuedAt: Date;
};

function tons(value: DecimalValue): number {
  return value.toNumber();
}

function optionalTons(value: DecimalValue | null): number | undefined {
  return value === null ? undefined : value.toNumber();
}

function toFuelBreakdown(row: LoadsheetRow): FuelBreakdown | null {
  const {
    fuelBlock,
    fuelTaxi,
    fuelTrip,
    fuelAlternate,
    fuelReserve,
    fuelContingencyAmount,
    fuelMel,
    fuelAtc,
    fuelWxx,
    fuelExtra,
    fuelTankering,
  } = row;

  if (
    fuelBlock === null ||
    fuelTaxi === null ||
    fuelTrip === null ||
    fuelAlternate === null ||
    fuelReserve === null ||
    fuelContingencyAmount === null ||
    fuelMel === null ||
    fuelAtc === null ||
    fuelWxx === null ||
    fuelExtra === null ||
    fuelTankering === null
  ) {
    return null;
  }

  return {
    block: tons(fuelBlock),
    taxi: tons(fuelTaxi),
    trip: tons(fuelTrip),
    alternate: tons(fuelAlternate),
    reserve: tons(fuelReserve),
    contingencyType: row.fuelContingencyType,
    contingencyAmount: tons(fuelContingencyAmount),
    mel: tons(fuelMel),
    atc: tons(fuelAtc),
    wxx: tons(fuelWxx),
    extra: tons(fuelExtra),
    tankering: tons(fuelTankering),
    etops: optionalTons(row.fuelEtops),
    minTakeoff: optionalTons(row.fuelMinTakeoff),
    planTakeoff: optionalTons(row.fuelPlanTakeoff),
    planLanding: optionalTons(row.fuelPlanLanding),
    averageFuelFlow: optionalTons(row.fuelAverageFlow),
    maxTanks: optionalTons(row.fuelMaxTanks),
  };
}

function toPassengersByCabin(row: LoadsheetRow): PassengerCounts | null {
  const counts = CABINS.reduce<PassengerCounts>((seated, cabin) => {
    const passengers = row[CABIN_COLUMNS[cabin]];

    return passengers === null ? seated : { ...seated, [cabin]: passengers };
  }, {});

  return Object.keys(counts).length === 0 ? null : counts;
}

export function toFlightLoadsheet(row: LoadsheetRow): FlightLoadsheet {
  return {
    id: row.id,
    kind: row.kind as LoadsheetKind,
    revision: row.revision,
    issuedById: row.issuedById,
    issuedAt: row.issuedAt,
    flightCrew: {
      pilots: row.pilots,
      reliefPilots: row.reliefPilots,
      cabinCrew: row.cabinCrew,
    },
    passengers: row.passengers,
    passengersByCabin: toPassengersByCabin(row),
    passengerMass:
      row.passengerMass === null ? null : row.passengerMass.toNumber(),
    cargo: tons(row.cargo),
    payload: tons(row.payload),
    zeroFuelWeight: tons(row.zeroFuelWeight),
    blockFuel: tons(row.blockFuel),
    fuel: toFuelBreakdown(row),
  };
}
