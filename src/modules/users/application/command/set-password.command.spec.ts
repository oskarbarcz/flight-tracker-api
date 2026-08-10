import { SetPasswordCommand, SetPasswordHandler } from './set-password.command';
import { SignOutOtherSessionsCommand } from '../../../auth/application/command/sign-out-other-sessions.command';
import { PasswordAlreadySetError } from '../../model/error/user-password.error';

const USER_ID = '59bd52f0-6523-4a04-b1f7-96098db05fd0';
const SESSION_ID = 'b1d0c9f4-1f2e-4a63-9a52-7c0d3e5b8a41';
const NEW_PASSWORD = 'NeWsTr0nGP@$$w0rd';

describe('SetPasswordHandler', () => {
  let users: {
    hasPassword: jest.Mock;
    setPassword: jest.Mock;
  };
  let commandBus: { execute: jest.Mock };
  let handler: SetPasswordHandler;

  function command(newPassword = NEW_PASSWORD) {
    return new SetPasswordCommand(USER_ID, SESSION_ID, newPassword);
  }

  beforeEach(() => {
    users = {
      hasPassword: jest.fn().mockResolvedValue(false),
      setPassword: jest.fn(),
    };
    commandBus = { execute: jest.fn() };
    handler = new SetPasswordHandler(users as never, commandBus as never);
  });

  it('stores the first password and revokes every session but the acting one', async () => {
    await handler.execute(command());

    expect(users.setPassword).toHaveBeenCalledWith(USER_ID, NEW_PASSWORD);
    const signOut = commandBus.execute.mock
      .calls[0][0] as SignOutOtherSessionsCommand;
    expect(signOut).toBeInstanceOf(SignOutOtherSessionsCommand);
    expect(signOut.userId).toBe(USER_ID);
    expect(signOut.sessionId).toBe(SESSION_ID);
  });

  it('rejects an account that already has a password, leaving it untouched', async () => {
    users.hasPassword.mockResolvedValue(true);

    await expect(handler.execute(command())).rejects.toThrow(
      PasswordAlreadySetError,
    );
    expect(users.setPassword).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
