import {
  RequestPasswordResetCommand,
  RequestPasswordResetHandler,
} from './request-password-reset.command';
import { UserTokenType } from '../../../../../prisma/client/client';
import { PasswordResetRequestedEvent } from '../../../../core/domain/events/dto/user-credentials.events';

const USER_ID = 'a3d5f9d0-6f8e-4c2b-8f3a-9c1b7e2d4a55';
const EMAIL = 'operations@example.com';
const RAW_TOKEN = 'wS3xk1Nn7Yc9pQvR2tLmB4dF6hJ8kZgA';

describe('RequestPasswordResetHandler', () => {
  let users: { findByEmail: jest.Mock; hasPassword: jest.Mock };
  let tokens: { findRecentUnconsumed: jest.Mock; issue: jest.Mock };
  let eventEmitter: { emit: jest.Mock };
  let handler: RequestPasswordResetHandler;

  beforeEach(() => {
    users = {
      findByEmail: jest.fn().mockResolvedValue({ id: USER_ID, email: EMAIL }),
      hasPassword: jest.fn().mockResolvedValue(true),
    };
    tokens = {
      findRecentUnconsumed: jest.fn().mockResolvedValue(null),
      issue: jest
        .fn()
        .mockResolvedValue({ id: 'token-id', rawToken: RAW_TOKEN }),
    };
    eventEmitter = { emit: jest.fn() };
    handler = new RequestPasswordResetHandler(
      users as never,
      tokens as never,
      eventEmitter as never,
    );
  });

  it('issues a one-hour token and emits the request event', async () => {
    await handler.execute(new RequestPasswordResetCommand(EMAIL));

    expect(tokens.issue).toHaveBeenCalledWith(
      USER_ID,
      UserTokenType.password_reset,
      60 * 60 * 1000,
    );

    const event = eventEmitter.emit.mock
      .calls[0][0] as PasswordResetRequestedEvent;
    expect(event).toBeInstanceOf(PasswordResetRequestedEvent);
    expect(event.payload).toEqual({
      userId: USER_ID,
      email: EMAIL,
      token: RAW_TOKEN,
    });
  });

  it('stays silent for an address no account uses', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(
      handler.execute(new RequestPasswordResetCommand('nobody@example.com')),
    ).resolves.toBeUndefined();
    expect(tokens.issue).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('stays silent for an account that has no password to reset', async () => {
    users.hasPassword.mockResolvedValue(false);

    await expect(
      handler.execute(new RequestPasswordResetCommand(EMAIL)),
    ).resolves.toBeUndefined();
    expect(tokens.issue).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('suppresses a repeat request made within the five-minute guard', async () => {
    tokens.findRecentUnconsumed.mockResolvedValue({ id: 'pending-token' });

    await expect(
      handler.execute(new RequestPasswordResetCommand(EMAIL)),
    ).resolves.toBeUndefined();

    expect(tokens.findRecentUnconsumed).toHaveBeenCalledWith(
      USER_ID,
      UserTokenType.password_reset,
      5 * 60 * 1000,
    );
    expect(tokens.issue).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});
