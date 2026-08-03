import { GetOwnUserHandler, GetOwnUserQuery } from './get-own-user.query';
import { UserTokenType } from '../../../../../prisma/client/client';

const USER_ID = 'a3d5f9d0-6f8e-4c2b-8f3a-9c1b7e2d4a55';
const EMAIL = 'operations@example.com';
const PENDING_EMAIL = 'alice.new@example.com';
const CONFIRMED_AT = new Date('2025-01-01T00:00:00.000Z');

describe('GetOwnUserHandler', () => {
  let repository: { findOwnById: jest.Mock };
  let tokens: { findPending: jest.Mock };
  let handler: GetOwnUserHandler;

  beforeEach(() => {
    repository = {
      findOwnById: jest.fn().mockResolvedValue({
        id: USER_ID,
        name: 'Alice Doe',
        email: EMAIL,
        emailConfirmedAt: CONFIRMED_AT,
        simbriefUserId: null,
      }),
    };
    tokens = { findPending: jest.fn().mockResolvedValue(null) };
    handler = new GetOwnUserHandler(repository as never, tokens as never);
  });

  it('reports the active address as the only one when nothing is pending', async () => {
    const result = await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(result.emails).toEqual([
      { email: EMAIL, isConfirmed: true, active: true },
    ]);
  });

  it('looks up the pending email change of that user', async () => {
    await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(tokens.findPending).toHaveBeenCalledWith(
      USER_ID,
      UserTokenType.email_change,
    );
  });

  it('adds the pending address as unconfirmed and inactive', async () => {
    tokens.findPending.mockResolvedValue({ newEmail: PENDING_EMAIL });

    const result = await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(result.emails).toEqual([
      { email: EMAIL, isConfirmed: true, active: true },
      { email: PENDING_EMAIL, isConfirmed: false, active: false },
    ]);
  });

  it('reports an unproven active address as unconfirmed', async () => {
    repository.findOwnById.mockResolvedValue({
      id: USER_ID,
      name: 'Emma Doe',
      email: 'emma.doe@example.com',
      emailConfirmedAt: null,
      simbriefUserId: null,
    });

    const result = await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(result.emails).toEqual([
      { email: 'emma.doe@example.com', isConfirmed: false, active: true },
    ]);
  });

  it('keeps the confirmation timestamp out of the response', async () => {
    const result = await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(result).not.toHaveProperty('emailConfirmedAt');
    expect(result.email).toBe(EMAIL);
  });
});
