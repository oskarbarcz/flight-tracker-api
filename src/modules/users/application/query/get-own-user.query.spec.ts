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
        googleId: null,
        googleEmail: null,
        discordId: null,
        discordUsername: null,
        discordGlobalName: null,
        discordAvatar: null,
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
      googleId: null,
      googleEmail: null,
      discordId: null,
      discordUsername: null,
      discordGlobalName: null,
      discordAvatar: null,
    });

    const result = await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(result.emails).toEqual([
      { email: 'emma.doe@example.com', isConfirmed: false, active: true },
    ]);
  });

  it('reports an unlinked provider as nothing but a false flag', async () => {
    const result = await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(result.identities).toEqual({
      google: { linked: false },
      discord: { linked: false },
    });
  });

  it('reports a linked Discord account with the handle stored when it was linked', async () => {
    repository.findOwnById.mockResolvedValue({
      id: USER_ID,
      name: 'Michael Doe',
      email: EMAIL,
      emailConfirmedAt: CONFIRMED_AT,
      simbriefUserId: null,
      googleId: '104778392015664201883',
      googleEmail: 'michael@gmail.com',
      discordId: '100000000000000100',
      discordUsername: 'michael.doe',
      discordGlobalName: 'Michael Doe',
      discordAvatar: 'b1c2d3e4f5061728394a5b6c7d8e9f00',
    });

    const result = await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(result.identities).toEqual({
      google: { linked: true, email: 'michael@gmail.com' },
      discord: {
        linked: true,
        userId: '100000000000000100',
        username: 'michael.doe',
        globalName: 'Michael Doe',
        avatarUrl:
          'https://cdn.discordapp.com/avatars/100000000000000100/b1c2d3e4f5061728394a5b6c7d8e9f00.png',
      },
    });
  });

  it('keeps the raw identity columns out of the response', async () => {
    const result = await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(result).not.toHaveProperty('googleId');
    expect(result).not.toHaveProperty('discordId');
    expect(result).not.toHaveProperty('discordAvatar');
  });

  it('keeps the confirmation timestamp out of the response', async () => {
    const result = await handler.execute(new GetOwnUserQuery(USER_ID));

    expect(result).not.toHaveProperty('emailConfirmedAt');
    expect(result.email).toBe(EMAIL);
  });
});
