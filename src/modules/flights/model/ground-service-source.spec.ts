import { GsxAutomationDisabledError } from './error/flight.error';
import {
  GroundServiceSource,
  resolveGroundServiceSource,
} from './ground-service-source';

describe('resolveGroundServiceSource', () => {
  it('is manual when the pilot starts it and GSX is not set to', () => {
    expect(resolveGroundServiceSource(false, false)).toBe(
      GroundServiceSource.Manual,
    );
  });

  it('is an override when the pilot starts it while GSX is set to', () => {
    expect(resolveGroundServiceSource(false, true)).toBe(
      GroundServiceSource.Override,
    );
  });

  it('is GSX when GSX requested it and is allowed to', () => {
    expect(resolveGroundServiceSource(true, true)).toBe(
      GroundServiceSource.Gsx,
    );
  });

  it('refuses GSX when its setting is off', () => {
    expect(() => resolveGroundServiceSource(true, false)).toThrow(
      GsxAutomationDisabledError,
    );
  });
});
