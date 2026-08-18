import {
  VerifySimbriefUserHandler,
  VerifySimbriefUserQuery,
} from './verify-simbrief-user.query';
import { SimbriefClient } from '../../../../core/provider/simbrief/client/simbrief.client';
import { SimbriefUserNotFoundError } from '../../../../core/provider/simbrief/error/simbrief.error';
import { OperationalFlightPlan } from '../../../../core/provider/simbrief/type/simbrief.types';

const ofp = {
  fetch: { userid: '987654', status: 'Success' },
  params: { time_generated: '1786892517' },
  general: { icao_airline: 'DLH', flight_number: '0400' },
  origin: { icao_code: 'EDDF', iata_code: 'FRA', name: 'FRANKFURT INTL' },
  destination: { icao_code: 'EPWA', iata_code: 'WAW', name: 'WARSAW CHOPIN' },
  aircraft: { reg: 'D-AIRC', icaocode: 'A320', name: 'A320-200' },
  times: { sched_out: '1786891620', sched_in: '1786898820' },
} as OperationalFlightPlan;

function handlerReturning(
  plan: OperationalFlightPlan | null,
): VerifySimbriefUserHandler {
  const client = {
    findOperationalFlightPlan: () => Promise.resolve(plan),
  } as unknown as SimbriefClient;

  return new VerifySimbriefUserHandler(client);
}

describe('VerifySimbriefUserHandler', () => {
  it('reports the most recent flight plan of the account', async () => {
    const account = await handlerReturning(ofp).execute(
      new VerifySimbriefUserQuery('987654'),
    );

    expect(account).toEqual({
      simbriefUserId: '987654',
      latestFlight: {
        callsign: 'DLH0400',
        origin: {
          icaoCode: 'EDDF',
          iataCode: 'FRA',
          name: 'FRANKFURT INTL',
        },
        destination: {
          icaoCode: 'EPWA',
          iataCode: 'WAW',
          name: 'WARSAW CHOPIN',
        },
        aircraft: {
          registration: 'D-AIRC',
          type: 'A320',
          name: 'A320-200',
        },
        scheduledOffBlockTime: new Date('2026-08-16T14:47:00.000Z'),
        scheduledOnBlockTime: new Date('2026-08-16T16:47:00.000Z'),
        generatedAt: new Date('2026-08-16T15:01:57.000Z'),
      },
    });
  });

  it('reports the fields the plan leaves empty as null', async () => {
    const sparse = {
      params: {},
      general: { icao_airline: 'DLH', flight_number: '0400' },
      origin: { icao_code: 'EDDF', iata_code: {}, name: {} },
      destination: { icao_code: 'EPWA' },
      aircraft: { reg: 'D-AIRC' },
      times: {},
    } as unknown as OperationalFlightPlan;

    const account = await handlerReturning(sparse).execute(
      new VerifySimbriefUserQuery('987654'),
    );

    expect(account.latestFlight).toEqual({
      callsign: 'DLH0400',
      origin: { icaoCode: 'EDDF', iataCode: null, name: null },
      destination: { icaoCode: 'EPWA', iataCode: null, name: null },
      aircraft: { registration: 'D-AIRC', type: null, name: null },
      scheduledOffBlockTime: null,
      scheduledOnBlockTime: null,
      generatedAt: null,
    });
  });

  it('rejects a user ID Simbrief does not know', async () => {
    await expect(
      handlerReturning(null).execute(new VerifySimbriefUserQuery('999999')),
    ).rejects.toThrow(SimbriefUserNotFoundError);
  });
});
