import { SessionClient } from '../../auth/model/session-client';
import { GsxSourceRequiresTransponderError } from './error/flight.error';
import { GroundServiceSource, isRequestedByGsx } from './ground-service-source';

describe('isRequestedByGsx', () => {
  it('reports GSX when the Transponder names it', () => {
    expect(
      isRequestedByGsx(GroundServiceSource.Gsx, SessionClient.Transponder),
    ).toBe(true);
  });

  it.each([SessionClient.Web, SessionClient.Transponder])(
    'reports no GSX when %p names no source',
    (client) => {
      expect(isRequestedByGsx(undefined, client)).toBe(false);
    },
  );

  it('refuses GSX named by the browser', () => {
    expect(() =>
      isRequestedByGsx(GroundServiceSource.Gsx, SessionClient.Web),
    ).toThrow(GsxSourceRequiresTransponderError);
  });
});
