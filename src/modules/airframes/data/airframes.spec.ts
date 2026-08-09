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
});
