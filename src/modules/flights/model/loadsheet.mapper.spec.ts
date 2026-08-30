import { LoadsheetRow, toFlightLoadsheet } from './loadsheet.mapper';
import { LoadsheetKind } from './loadsheet.model';

function decimal(value: number): { toNumber(): number } {
  return { toNumber: () => value };
}

function row(overrides: Partial<LoadsheetRow> = {}): LoadsheetRow {
  return {
    id: 'ce2a3f26-6f0a-4a0e-9a1b-2f5c0a9f7b31',
    kind: 'preliminary',
    revision: 1,
    pilots: 2,
    reliefPilots: 1,
    cabinCrew: 6,
    passengers: 292,
    firstPassengers: null,
    businessPassengers: null,
    premiumEconomyPassengers: null,
    economyPassengers: null,
    passengerMass: null,
    cargo: decimal(8.9),
    payload: decimal(37.808),
    zeroFuelWeight: decimal(212.408),
    blockFuel: decimal(11.9),
    fuelBlock: null,
    fuelTaxi: null,
    fuelTrip: null,
    fuelAlternate: null,
    fuelReserve: null,
    fuelContingencyType: null,
    fuelContingencyAmount: null,
    fuelMel: null,
    fuelAtc: null,
    fuelWxx: null,
    fuelExtra: null,
    fuelTankering: null,
    fuelEtops: null,
    fuelMinTakeoff: null,
    fuelPlanTakeoff: null,
    fuelPlanLanding: null,
    fuelAverageFlow: null,
    fuelMaxTanks: null,
    issuedById: 'a6b2b3a4-52c5-4a0c-9d17-6a1c1a0e5f42',
    issuedAt: new Date('2026-01-01T11:45:00.000Z'),
    ...overrides,
  };
}

const requiredFuel = {
  fuelBlock: decimal(11.9),
  fuelTaxi: decimal(0.3),
  fuelTrip: decimal(9.6),
  fuelAlternate: decimal(0.9),
  fuelReserve: decimal(0.6),
  fuelContingencyType: '5% of trip',
  fuelContingencyAmount: decimal(0.5),
  fuelMel: decimal(0),
  fuelAtc: decimal(0),
  fuelWxx: decimal(0),
  fuelExtra: decimal(0),
  fuelTankering: decimal(0),
};

describe('toFlightLoadsheet', () => {
  it('reports every figure as a number', () => {
    const loadsheet = toFlightLoadsheet(row());

    expect(loadsheet.cargo).toBe(8.9);
    expect(loadsheet.payload).toBe(37.808);
    expect(loadsheet.zeroFuelWeight).toBe(212.408);
    expect(loadsheet.blockFuel).toBe(11.9);
    expect(loadsheet.flightCrew).toEqual({
      pilots: 2,
      reliefPilots: 1,
      cabinCrew: 6,
    });
  });

  it('reports the kind as a domain kind', () => {
    expect(toFlightLoadsheet(row({ kind: 'final' })).kind).toBe(
      LoadsheetKind.Final,
    );
  });

  it('reports no breakdown when no fuel column is set', () => {
    expect(toFlightLoadsheet(row()).fuel).toBeNull();
  });

  it('reports a breakdown carrying only its required figures', () => {
    const loadsheet = toFlightLoadsheet(row(requiredFuel));

    expect(loadsheet.fuel).toEqual({
      block: 11.9,
      taxi: 0.3,
      trip: 9.6,
      alternate: 0.9,
      reserve: 0.6,
      contingencyType: '5% of trip',
      contingencyAmount: 0.5,
      mel: 0,
      atc: 0,
      wxx: 0,
      extra: 0,
      tankering: 0,
      etops: undefined,
      minTakeoff: undefined,
      planTakeoff: undefined,
      planLanding: undefined,
      averageFuelFlow: undefined,
      maxTanks: undefined,
    });
  });

  it('reports the extended figures where they are set', () => {
    const loadsheet = toFlightLoadsheet(
      row({
        ...requiredFuel,
        fuelEtops: decimal(1.2),
        fuelMaxTanks: decimal(111),
      }),
    );

    expect(loadsheet.fuel?.etops).toBe(1.2);
    expect(loadsheet.fuel?.maxTanks).toBe(111);
  });

  it('reports no breakdown when a required fuel figure is missing', () => {
    const loadsheet = toFlightLoadsheet(
      row({ ...requiredFuel, fuelTaxi: null }),
    );

    expect(loadsheet.fuel).toBeNull();
  });

  it('reports a zeroed breakdown rather than none', () => {
    const zeroed = Object.fromEntries(
      Object.entries(requiredFuel).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : decimal(0),
      ]),
    ) as typeof requiredFuel;

    expect(toFlightLoadsheet(row(zeroed)).fuel?.block).toBe(0);
  });

  it('reports no passenger breakdown when no cabin carries a count', () => {
    expect(toFlightLoadsheet(row()).passengersByCabin).toBeNull();
  });

  it('reports the passenger breakdown keyed by cabin', () => {
    const loadsheet = toFlightLoadsheet(
      row({ businessPassengers: 42, economyPassengers: 250 }),
    );

    expect(loadsheet.passengersByCabin).toEqual({
      business: 42,
      economy: 250,
    });
  });

  it('reports a cabin carrying nobody as a zero, not as absent', () => {
    const loadsheet = toFlightLoadsheet(
      row({ businessPassengers: 0, economyPassengers: 292 }),
    );

    expect(loadsheet.passengersByCabin).toEqual({
      business: 0,
      economy: 292,
    });
  });

  it('reports no planned passenger mass where none was recorded', () => {
    expect(toFlightLoadsheet(row()).passengerMass).toBeNull();
  });

  it('reports the planned passenger mass where one was recorded', () => {
    expect(
      toFlightLoadsheet(row({ passengerMass: decimal(84.5) })).passengerMass,
    ).toBe(84.5);
  });
});
