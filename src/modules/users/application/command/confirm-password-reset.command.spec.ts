import {
  ConfirmPasswordResetCommand,
  ConfirmPasswordResetHandler,
} from './confirm-password-reset.command';
import { UserTokenType } from '../../../../../prisma/client/client';
import { SignOutEverywhereCommand } from '../../../auth/application/command/sign-out-everywhere.command';
import { InvalidPasswordResetTokenError } from '../../model/error/user-password.error';

const USER_ID = 'a3d5f9d0-6f8e-4c2b-8f3a-9c1b7e2d4a55';
const TOKEN_ID = '2b3f7d68-1c4a-45f2-8f1a-6d0e5b9a7c31';
const RAW_TOKEN = 'wS3xk1Nn7Yc9pQvR2tLmB4dF6hJ8kZgA';
const NEW_PASSWORD = 'NeWsTr0nGP@$$w0rd';

describe('ConfirmPasswordResetHandler', () => {
  let users: { setPassword: jest.Mock; dropOwnUserCache: jest.Mock };
  let tokens: {
    findValid: jest.Mock;
    consume: jest.Mock;
    deleteAllFor: jest.Mock;
  };
  let commandBus: { execute: jest.Mock };
  let handler: ConfirmPasswordResetHandler;

  function command(): ConfirmPasswordResetCommand {
    return new ConfirmPasswordResetCommand(RAW_TOKEN, NEW_PASSWORD);
  }

  beforeEach(() => {
    users = { setPassword: jest.fn(), dropOwnUserCache: jest.fn() };
    tokens = {
      findValid: jest.fn().mockResolvedValue({ id: TOKEN_ID, userId: USER_ID }),
      consume: jest.fn().mockResolvedValue(true),
      deleteAllFor: jest.fn(),
    };
    commandBus = { execute: jest.fn() };
    handler = new ConfirmPasswordResetHandler(
      users as never,
      tokens as never,
      commandBus as never,
    );
  });

  it('sets the new password, consumes the token and revokes every session', async () => {
    await handler.execute(command());

    expect(tokens.findValid).toHaveBeenCalledWith(
      UserTokenType.password_reset,
      RAW_TOKEN,
    );
    expect(users.setPassword).toHaveBeenCalledWith(USER_ID, NEW_PASSWORD);
    expect(tokens.consume).toHaveBeenCalledWith(TOKEN_ID);
    const signOut = commandBus.execute.mock
      .calls[0][0] as SignOutEverywhereCommand;
    expect(signOut).toBeInstanceOf(SignOutEverywhereCommand);
    expect(signOut.userId).toBe(USER_ID);
  });

  it('rejects a token that is unknown, expired, superseded or already used', async () => {
    tokens.findValid.mockResolvedValue(null);

    await expect(handler.execute(command())).rejects.toThrow(
      InvalidPasswordResetTokenError,
    );
    expect(users.setPassword).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('rejects a token another request consumed first', async () => {
    tokens.consume.mockResolvedValue(false);

    await expect(handler.execute(command())).rejects.toThrow(
      InvalidPasswordResetTokenError,
    );
    expect(users.setPassword).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('consumes the token before setting the password', async () => {
    const order: string[] = [];
    tokens.consume.mockImplementation(() => {
      order.push('consume');
      return Promise.resolve(true);
    });
    users.setPassword.mockImplementation(() => {
      order.push('setPassword');
      return Promise.resolve();
    });

    await handler.execute(command());

    expect(order).toEqual(['consume', 'setPassword']);
  });

  it('revokes a pending email change of the same account', async () => {
    await handler.execute(command());

    expect(tokens.deleteAllFor).toHaveBeenCalledWith(
      USER_ID,
      UserTokenType.email_change,
    );
  });
});
