import {
  AssertSimbriefUserExistsHandler,
  AssertSimbriefUserExistsQuery,
} from './assert-simbrief-user-exists.query';
import { SimbriefClient } from '../../../../core/provider/simbrief/client/simbrief.client';
import { SimbriefUnavailableError } from '../../../../core/provider/simbrief/error/simbrief.error';
import { OperationalFlightPlan } from '../../../../core/provider/simbrief/type/simbrief.types';
import { InvalidSimbriefUserIdError } from '../../model/error/simbrief.error';

function handlerAnswering(
  answer: () => Promise<OperationalFlightPlan | null>,
): AssertSimbriefUserExistsHandler {
  const client = {
    findOperationalFlightPlan: answer,
  } as unknown as SimbriefClient;

  return new AssertSimbriefUserExistsHandler(client);
}

describe('AssertSimbriefUserExistsHandler', () => {
  it('accepts a user ID Simbrief resolves', async () => {
    const handler = handlerAnswering(() =>
      Promise.resolve({} as OperationalFlightPlan),
    );

    await expect(
      handler.execute(new AssertSimbriefUserExistsQuery('987654')),
    ).resolves.toBeUndefined();
  });

  it('rejects a user ID Simbrief does not know', async () => {
    const handler = handlerAnswering(() => Promise.resolve(null));

    await expect(
      handler.execute(new AssertSimbriefUserExistsQuery('999999')),
    ).rejects.toThrow(InvalidSimbriefUserIdError);
  });

  it('accepts a user ID Simbrief could not confirm', async () => {
    const handler = handlerAnswering(() =>
      Promise.reject(new SimbriefUnavailableError()),
    );

    await expect(
      handler.execute(new AssertSimbriefUserExistsQuery('987654')),
    ).resolves.toBeUndefined();
  });
});
