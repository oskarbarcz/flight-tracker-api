import {
  assertPayloadAccountsForLoad,
  capPassengersAtSeatCapacity,
} from './loadsheet.policy';
import { PayloadBelowLoadError } from './error/flight.error';
import { Loadsheet } from './loadsheet.model';
import { STANDARD_ADULT_KG } from '../../manifest/model/baggage';

function loadsheet(overrides: Partial<Loadsheet>): Loadsheet {
  return {
    flightCrew: { pilots: 2, reliefPilots: 0, cabinCrew: 6 },
    passengers: 0,
    cargo: 0,
    payload: 0,
    zeroFuelWeight: 100,
    blockFuel: 10,
    ...overrides,
  } as Loadsheet;
}

describe('assertPayloadAccountsForLoad', () => {
  it('rejects a payload smaller than the cargo it declares', () => {
    const sheet = loadsheet({ payload: 4, cargo: 7, passengers: 188 });

    expect(() => assertPayloadAccountsForLoad(sheet)).toThrow(
      PayloadBelowLoadError,
    );
  });

  it('rejects a payload that covers the cargo but not the passengers', () => {
    const sheet = loadsheet({ payload: 7.5, cargo: 7, passengers: 188 });

    expect(() => assertPayloadAccountsForLoad(sheet)).toThrow(
      PayloadBelowLoadError,
    );
  });

  it('accepts a payload accounting for the load exactly', () => {
    const passengers = 188;
    const cargoTons = 7;
    const payload = cargoTons + (passengers * STANDARD_ADULT_KG) / 1000;
    const sheet = loadsheet({ payload, cargo: cargoTons, passengers });

    expect(() => assertPayloadAccountsForLoad(sheet)).not.toThrow();
  });

  it('accepts a payload leaving room for baggage', () => {
    const sheet = loadsheet({ payload: 25, cargo: 7, passengers: 188 });

    expect(() => assertPayloadAccountsForLoad(sheet)).not.toThrow();
  });

  it('accepts an empty flight', () => {
    const sheet = loadsheet({ payload: 0, cargo: 0, passengers: 0 });

    expect(() => assertPayloadAccountsForLoad(sheet)).not.toThrow();
  });

  it('names the shortfall it rejected', () => {
    const sheet = loadsheet({ payload: 4, cargo: 7, passengers: 100 });

    expect(() => assertPayloadAccountsForLoad(sheet)).toThrow(
      'Payload of 4000 kg cannot carry 15400 kg of cargo and passengers.',
    );
  });

  it('accepts a payload planned at a lighter passenger', () => {
    const sheet = loadsheet({
      payload: 22.6,
      cargo: 1.2,
      passengers: 267,
      passengerMass: 80,
    });

    expect(() => assertPayloadAccountsForLoad(sheet)).not.toThrow();
  });

  it('rejects that same payload once no mass is recorded', () => {
    const sheet = loadsheet({ payload: 22.6, cargo: 1.2, passengers: 267 });

    expect(() => assertPayloadAccountsForLoad(sheet)).toThrow(
      'Payload of 22600 kg cannot carry 23628 kg of cargo and passengers.',
    );
  });

  it('rejects a payload short of the mass it was planned with', () => {
    const sheet = loadsheet({
      payload: 22.5,
      cargo: 1.2,
      passengers: 267,
      passengerMass: 80,
    });

    expect(() => assertPayloadAccountsForLoad(sheet)).toThrow(
      PayloadBelowLoadError,
    );
  });

  it('rests on the cargo alone when no passengers are carried', () => {
    const sheet = loadsheet({ payload: 7, cargo: 7, passengers: 0 });

    expect(() => assertPayloadAccountsForLoad(sheet)).not.toThrow();
  });
});

describe('capPassengersAtSeatCapacity', () => {
  const planned = loadsheet({
    passengers: 348,
    passengerMass: 86,
    cargo: 8.004,
    payload: 37.932,
    zeroFuelWeight: 206.523,
  });

  it('keeps a load that fits the cabin', () => {
    expect(capPassengersAtSeatCapacity(planned, 364)).toBe(planned);
  });

  it('keeps a load that fills the cabin exactly', () => {
    expect(capPassengersAtSeatCapacity(planned, 348)).toBe(planned);
  });

  it('keeps the load when the aircraft has no cabin layout', () => {
    expect(capPassengersAtSeatCapacity(planned, null)).toBe(planned);
  });

  it('seats no more passengers than the cabin has seats', () => {
    expect(capPassengersAtSeatCapacity(planned, 220).passengers).toBe(220);
  });

  it('takes the mass of every passenger left behind off the payload and the zero fuel weight', () => {
    const capped = capPassengersAtSeatCapacity(planned, 220);

    expect(capped.payload).toBe(26.924);
    expect(capped.zeroFuelWeight).toBe(195.515);
  });

  it('keeps the cargo, the fuel and the planned passenger mass', () => {
    const capped = capPassengersAtSeatCapacity(planned, 220);

    expect(capped.cargo).toBe(8.004);
    expect(capped.blockFuel).toBe(10);
    expect(capped.passengerMass).toBe(86);
  });

  it('leaves a payload that still accounts for the load it carries', () => {
    const capped = capPassengersAtSeatCapacity(planned, 220);

    expect(() => assertPayloadAccountsForLoad(capped)).not.toThrow();
  });

  it('drops a cabin breakdown it can no longer honour', () => {
    const withBreakdown = loadsheet({
      passengers: 300,
      passengersByCabin: { business: 40, economy: 260 },
      payload: 40,
    });

    expect(
      capPassengersAtSeatCapacity(withBreakdown, 220).passengersByCabin,
    ).toBeNull();
  });

  it('weighs the passengers left behind at the standard adult when no mass is recorded', () => {
    const unplanned = loadsheet({ passengers: 230, payload: 30 });
    const capped = capPassengersAtSeatCapacity(unplanned, 220);

    expect(capped.payload).toBe(
      Math.round((30 - (10 * STANDARD_ADULT_KG) / 1000) * 1000) / 1000,
    );
  });
});
