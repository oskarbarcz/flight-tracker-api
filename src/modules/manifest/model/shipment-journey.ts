import { Continent } from '../../airports/model/airport.model';

export enum TransferRole {
  Local = 'local',
  OutboundTransfer = 'outbound_transfer',
  InboundTransfer = 'inbound_transfer',
  ThroughTransfer = 'through_transfer',
}

export const MINIMUM_CONNECTION_MINUTES = 90;
const MIN_CONNECTION_DRAW = 45;
const MAX_CONNECTION_DRAW = 600;
const INBOUND_TRANSFER_CHANCE = 0.3;
const BEYOND_DESTINATION_CHANCE = 0.3;
const SAME_REGION_PREFERENCE = 0.75;

export type CargoAirport = {
  iataCode: string;
  continent: Continent;
};

export type FlightLeg = {
  departure: string;
  arrival: string;
};

export type ShipmentJourney = {
  origin: string;
  destination: string;
  transferRole: TransferRole;
  onwardCarrier: string | null;
  onwardFlightNumber: string | null;
  connectionMinutes: number | null;
};

export type JourneyContext = {
  leg: FlightLeg;
  departureContinent: Continent;
  arrivalContinent: Continent;
  candidates: CargoAirport[];
  carriers: string[];
  random: () => number;
};

export function transferRoleOf(
  origin: string,
  destination: string,
  leg: FlightLeg,
): TransferRole {
  const raisedHere = origin === leg.departure;
  const terminatesHere = destination === leg.arrival;

  if (raisedHere) {
    return terminatesHere ? TransferRole.Local : TransferRole.OutboundTransfer;
  }

  return terminatesHere
    ? TransferRole.InboundTransfer
    : TransferRole.ThroughTransfer;
}

export function isRaisedByOperator(role: TransferRole): boolean {
  return role === TransferRole.Local || role === TransferRole.OutboundTransfer;
}

export function isTightConnection(connectionMinutes: number | null): boolean {
  return (
    connectionMinutes !== null && connectionMinutes < MINIMUM_CONNECTION_MINUTES
  );
}

export function pickAirport(
  candidates: CargoAirport[],
  preferred: Continent,
  random: () => number,
): CargoAirport | null {
  if (candidates.length === 0) {
    return null;
  }

  const sameRegion = candidates.filter(
    (airport) => airport.continent === preferred,
  );
  const pool =
    sameRegion.length > 0 && random() < SAME_REGION_PREFERENCE
      ? sameRegion
      : candidates;

  return pool[Math.floor(random() * pool.length)] ?? null;
}

export function drawBeyondPoint(context: JourneyContext): string | null {
  const beyond = pickAirport(
    context.candidates.filter(
      (airport) => airport.iataCode !== context.leg.arrival,
    ),
    context.arrivalContinent,
    context.random,
  );

  return beyond?.iataCode ?? null;
}

export function drawJourney(
  context: JourneyContext,
  destination?: string | null,
): ShipmentJourney {
  const { leg, departureContinent, candidates, carriers, random } = context;

  const inbound =
    random() < INBOUND_TRANSFER_CHANCE &&
    candidates.some((airport) => airport.iataCode !== leg.departure);
  const origin = inbound
    ? (pickAirport(
        candidates.filter((airport) => airport.iataCode !== leg.departure),
        departureContinent,
        random,
      )?.iataCode ?? leg.departure)
    : leg.departure;

  const resolvedDestination =
    destination === undefined
      ? ((random() < BEYOND_DESTINATION_CHANCE
          ? drawBeyondPoint(context)
          : null) ?? leg.arrival)
      : (destination ?? leg.arrival);

  const role = transferRoleOf(origin, resolvedDestination, leg);
  const continues = resolvedDestination !== leg.arrival;
  const onwardCarrier = continues ? nextCarrier(carriers, random) : null;

  return {
    origin,
    destination: resolvedDestination,
    transferRole: role,
    onwardCarrier,
    onwardFlightNumber: onwardCarrier
      ? `${onwardCarrier}${1000 + Math.floor(random() * 9000)}`
      : null,
    connectionMinutes: continues
      ? MIN_CONNECTION_DRAW +
        Math.floor(random() * (MAX_CONNECTION_DRAW - MIN_CONNECTION_DRAW))
      : null,
  };
}

function nextCarrier(carriers: string[], random: () => number): string | null {
  if (carriers.length === 0) {
    return null;
  }

  return carriers[Math.floor(random() * carriers.length)];
}
