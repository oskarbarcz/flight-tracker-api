import { assertPayloadAccountsForLoad } from './loadsheet.policy';
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
});
