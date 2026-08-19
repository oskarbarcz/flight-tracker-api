import { AIRFRAMES, findAirframeByType } from './airframes';
import { AirframeServiceType } from '../model/airframe.model';

describe('airframes dataset', () => {
  it('declares a known service type for every airframe', () => {
    const serviceTypes = Object.values(AirframeServiceType);
    const invalid = AIRFRAMES.filter(
      (airframe) => !serviceTypes.includes(airframe.serviceType),
    );

    expect(invalid).toEqual([]);
  });

  it('serves only freighters as cargo', () => {
    expect(findAirframeByType('B77F')?.serviceType).toBe(
      AirframeServiceType.Cargo,
    );
    expect(findAirframeByType('B772')?.serviceType).toBe(
      AirframeServiceType.Passenger,
    );
    expect(findAirframeByType('C208')?.serviceType).toBe(
      AirframeServiceType.Both,
    );
  });

  it('records an IATA type code on every entry', () => {
    const withoutKey = AIRFRAMES.filter(
      (airframe) => !('iataType' in airframe),
    );

    expect(withoutKey).toEqual([]);
  });

  it('states IATA codes as two to three upper-case characters', () => {
    const malformed = AIRFRAMES.filter(
      (airframe) =>
        airframe.iataType !== null &&
        !/^[A-Z0-9]{2,3}$/.test(airframe.iataType),
    );

    expect(malformed).toEqual([]);
  });

  it('maps the ICAO designator of a layout-covered type to its IATA code', () => {
    expect(findAirframeByType('B77W')?.iataType).toBe('77W');
    expect(findAirframeByType('A321')?.iataType).toBe('321');
    expect(findAirframeByType('B738')?.iataType).toBe('738');
    expect(findAirframeByType('B752')?.iataType).toBe('752');
    expect(findAirframeByType('A320')?.iataType).toBe('320');
  });

  it('leaves the IATA code null where IATA publishes none', () => {
    expect(findAirframeByType('C172')?.iataType).toBeNull();
    expect(findAirframeByType('BBJ1')?.iataType).toBeNull();
  });
});
