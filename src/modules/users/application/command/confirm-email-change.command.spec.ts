import {
  ConfirmEmailChangeCommand,
  ConfirmEmailChangeHandler,
} from './confirm-email-change.command';
import { UserTokenType } from '../../../../../prisma/client/client';
import { SignOutEverywhereCommand } from '../../../auth/application/command/sign-out-everywhere.command';
import {
  EmailAlreadyInUseError,
  InvalidEmailChangeTokenError,
} from '../../model/error/user-email.error';

const USER_ID = 'a3d5f9d0-6f8e-4c2b-8f3a-9c1b7e2d4a55';
const TOKEN_ID = '2b3f7d68-1c4a-45f2-8f1a-6d0e5b9a7c31';
const NEW_EMAIL = 'alan.new@example.com';
const RAW_TOKEN = 'wS3xk1Nn7Yc9pQvR2tLmB4dF6hJ8kZgA';

describe('ConfirmEmailChangeHandler', () => {
  let users: { setEmail: jest.Mock; isEmailTaken: jest.Mock };
  let tokens: { findValid: jest.Mock; consume: jest.Mock };
  let commandBus: { execute: jest.Mock };
  let handler: ConfirmEmailChangeHandler;

  beforeEach(() => {
    users = {
      setEmail: jest.fn(),
      isEmailTaken: jest.fn().mockResolvedValue(false),
    };
    tokens = {
      findValid: jest.fn().mockResolvedValue({
        id: TOKEN_ID,
        userId: USER_ID,
        newEmail: NEW_EMAIL,
      }),
      consume: jest.fn().mockResolvedValue(true),
    };
    commandBus = { execute: jest.fn() };
    handler = new ConfirmEmailChangeHandler(
      users as never,
      tokens as never,
      commandBus as never,
    );
  });

  it('applies the pending address, consumes the token and revokes every session', async () => {
    await handler.execute(new ConfirmEmailChangeCommand(RAW_TOKEN));

    expect(tokens.findValid).toHaveBeenCalledWith(
      UserTokenType.email_change,
      RAW_TOKEN,
    );
    expect(users.setEmail).toHaveBeenCalledWith(USER_ID, NEW_EMAIL);
    expect(tokens.consume).toHaveBeenCalledWith(TOKEN_ID);
    const signOut = commandBus.execute.mock
      .calls[0][0] as SignOutEverywhereCommand;
    expect(signOut).toBeInstanceOf(SignOutEverywhereCommand);
    expect(signOut.userId).toBe(USER_ID);
  });

  it('rejects a token that is unknown, expired, superseded or already used', async () => {
    tokens.findValid.mockResolvedValue(null);

    await expect(
      handler.execute(new ConfirmEmailChangeCommand(RAW_TOKEN)),
    ).rejects.toThrow(InvalidEmailChangeTokenError);
    expect(users.setEmail).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('rejects a token that carries no pending address', async () => {
    tokens.findValid.mockResolvedValue({
      id: TOKEN_ID,
      userId: USER_ID,
      newEmail: null,
    });

    await expect(
      handler.execute(new ConfirmEmailChangeCommand(RAW_TOKEN)),
    ).rejects.toThrow(InvalidEmailChangeTokenError);
    expect(users.setEmail).not.toHaveBeenCalled();
  });

  it('leaves the address alone when it was taken between request and confirmation', async () => {
    users.isEmailTaken.mockResolvedValue(true);

    await expect(
      handler.execute(new ConfirmEmailChangeCommand(RAW_TOKEN)),
    ).rejects.toThrow(EmailAlreadyInUseError);
    expect(users.isEmailTaken).toHaveBeenCalledWith(NEW_EMAIL, USER_ID);
    expect(users.setEmail).not.toHaveBeenCalled();
    expect(tokens.consume).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('rejects a token another request consumed first', async () => {
    tokens.consume.mockResolvedValue(false);

    await expect(
      handler.execute(new ConfirmEmailChangeCommand(RAW_TOKEN)),
    ).rejects.toThrow(InvalidEmailChangeTokenError);
    expect(users.setEmail).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('consumes the token before applying the address', async () => {
    const order: string[] = [];
    tokens.consume.mockImplementation(() => {
      order.push('consume');
      return Promise.resolve(true);
    });
    users.setEmail.mockImplementation(() => {
      order.push('setEmail');
      return Promise.resolve();
    });

    await handler.execute(new ConfirmEmailChangeCommand(RAW_TOKEN));

    expect(order).toEqual(['consume', 'setEmail']);
  });
});
