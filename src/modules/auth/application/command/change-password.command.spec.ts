import {
  ChangePasswordCommand,
  ChangePasswordHandler,
} from './change-password.command';
import {
  InvalidCredentialsError,
  NewPasswordMustDifferError,
  PasswordNotSetError,
} from '../../model/error/auth.error';

const USER_ID = 'a3d5f9d0-6f8e-4c2b-8f3a-9c1b7e2d4a55';
const SESSION_ID = 'c7f1b4e2-93a4-4a10-8f66-2b5d8c1e7f30';
const CURRENT_PASSWORD = 'P@$$w0rd';
const NEW_PASSWORD = 'NeWsTr0nGP@$$w0rd';

describe('ChangePasswordHandler', () => {
  let users: {
    hasPassword: jest.Mock;
    verifyPassword: jest.Mock;
    setPassword: jest.Mock;
  };
  let sessionService: {
    closeAllForUserExcept: jest.Mock;
    closeAllForUser: jest.Mock;
  };
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
    };
    sessionService = {
      closeAllForUserExcept: jest.fn(),
      closeAllForUser: jest.fn(),
    };
    handler = new ChangePasswordHandler(
      users as never,
      sessionService as never,
    );
  });

  it('stores the new password and revokes every session but the acting one', async () => {
    await handler.execute(command());

    expect(users.setPassword).toHaveBeenCalledWith(USER_ID, NEW_PASSWORD);
    expect(sessionService.closeAllForUserExcept).toHaveBeenCalledWith(
      USER_ID,
      SESSION_ID,
    );
    expect(sessionService.closeAllForUser).not.toHaveBeenCalled();
  });

  it('rejects an account that has no password, without touching bcrypt', async () => {
    users.hasPassword.mockResolvedValue(false);

    await expect(handler.execute(command())).rejects.toThrow(
      PasswordNotSetError,
    );
    expect(users.verifyPassword).not.toHaveBeenCalled();
    expect(users.setPassword).not.toHaveBeenCalled();
    expect(sessionService.closeAllForUserExcept).not.toHaveBeenCalled();
  });

  it('rejects a wrong current password and leaves the stored password alone', async () => {
    users.verifyPassword.mockResolvedValue(false);

    await expect(handler.execute(command('WrongP@$$w0rd'))).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(users.setPassword).not.toHaveBeenCalled();
    expect(sessionService.closeAllForUserExcept).not.toHaveBeenCalled();
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
});
