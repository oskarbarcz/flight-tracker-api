import {
  ChangePasswordCommand,
  ChangePasswordHandler,
} from './change-password.command';
import { UserTokenType } from '../../../../../prisma/client/client';
import { InvalidCredentialsError } from '../../../auth/model/error/auth.error';
import { SignOutOtherSessionsCommand } from '../../../auth/application/command/sign-out-other-sessions.command';
import {
  NewPasswordMustDifferError,
  PasswordNotSetError,
} from '../../model/error/user-password.error';

const USER_ID = 'a3d5f9d0-6f8e-4c2b-8f3a-9c1b7e2d4a55';
const SESSION_ID = 'c7f1b4e2-93a4-4a10-8f66-2b5d8c1e7f30';
const CURRENT_PASSWORD = 'P@$$w0rd';
const NEW_PASSWORD = 'NeWsTr0nGP@$$w0rd';

describe('ChangePasswordHandler', () => {
  let users: {
    hasPassword: jest.Mock;
    verifyPassword: jest.Mock;
    setPassword: jest.Mock;
    dropOwnUserCache: jest.Mock;
  };
  let tokens: { deleteAllFor: jest.Mock };
  let commandBus: { execute: jest.Mock };
  let handler: ChangePasswordHandler;

  function command(
    currentPassword = CURRENT_PASSWORD,
    newPassword = NEW_PASSWORD,
  ) {
    return new ChangePasswordCommand(
      USER_ID,
      SESSION_ID,
      currentPassword,
      newPassword,
    );
  }

  beforeEach(() => {
    users = {
      hasPassword: jest.fn().mockResolvedValue(true),
      verifyPassword: jest.fn().mockResolvedValue(true),
      setPassword: jest.fn(),
      dropOwnUserCache: jest.fn(),
    };
    tokens = { deleteAllFor: jest.fn() };
    commandBus = { execute: jest.fn() };
    handler = new ChangePasswordHandler(
      users as never,
      tokens as never,
      commandBus as never,
    );
  });

  it('stores the new password and revokes every session but the acting one', async () => {
    await handler.execute(command());

    expect(users.setPassword).toHaveBeenCalledWith(USER_ID, NEW_PASSWORD);
    const signOut = commandBus.execute.mock
      .calls[0][0] as SignOutOtherSessionsCommand;
    expect(signOut).toBeInstanceOf(SignOutOtherSessionsCommand);
    expect(signOut.userId).toBe(USER_ID);
    expect(signOut.sessionId).toBe(SESSION_ID);
  });

  it('rejects an account that has no password, without touching bcrypt', async () => {
    users.hasPassword.mockResolvedValue(false);

    await expect(handler.execute(command())).rejects.toThrow(
      PasswordNotSetError,
    );
    expect(users.verifyPassword).not.toHaveBeenCalled();
    expect(users.setPassword).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('rejects a wrong current password and leaves the stored password alone', async () => {
    users.verifyPassword.mockResolvedValue(false);

    await expect(handler.execute(command('WrongP@$$w0rd'))).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(users.setPassword).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('rejects a new password identical to the current one', async () => {
    await expect(
      handler.execute(command(CURRENT_PASSWORD, CURRENT_PASSWORD)),
    ).rejects.toThrow(NewPasswordMustDifferError);
    expect(users.setPassword).not.toHaveBeenCalled();
  });

  it('checks the current password before comparing it to the new one', async () => {
    users.verifyPassword.mockResolvedValue(false);

    await expect(
      handler.execute(command(CURRENT_PASSWORD, CURRENT_PASSWORD)),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('revokes a pending email change, so its link cannot still move the account', async () => {
    await handler.execute(command());

    expect(tokens.deleteAllFor).toHaveBeenCalledWith(
      USER_ID,
      UserTokenType.email_change,
    );
    expect(users.dropOwnUserCache).toHaveBeenCalledWith(USER_ID);
  });

  it('leaves a pending email change alone when the change is rejected', async () => {
    users.verifyPassword.mockResolvedValue(false);

    await expect(handler.execute(command())).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(tokens.deleteAllFor).not.toHaveBeenCalled();
  });
});
