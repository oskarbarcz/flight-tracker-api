import {
  UnlinkGoogleAccountCommand,
  UnlinkGoogleAccountHandler,
} from './unlink-google-account.command';
import { UserHasNoLinkedGoogleAccountError } from '../../../users/model/error/user.error';
import { CannotUnlinkWithoutPasswordError } from '../../../users/model/error/user-password.error';
import { InvalidCredentialsError } from '../../model/error/auth.error';

const USER_ID = 'e181d983-3b69-4be2-864e-2a7596217ddf';
const CURRENT_PASSWORD = 'P@$$w0rd';

describe('UnlinkGoogleAccountHandler', () => {
  let users: {
    hasLinkedGoogleAccount: jest.Mock;
    hasPassword: jest.Mock;
    verifyPassword: jest.Mock;
    unlinkGoogleAccount: jest.Mock;
  };
  let handler: UnlinkGoogleAccountHandler;

  function command(currentPassword = CURRENT_PASSWORD) {
    return new UnlinkGoogleAccountCommand(USER_ID, currentPassword);
  }

  beforeEach(() => {
    users = {
      hasLinkedGoogleAccount: jest.fn().mockResolvedValue(true),
      hasPassword: jest.fn().mockResolvedValue(true),
      verifyPassword: jest.fn().mockResolvedValue(true),
      unlinkGoogleAccount: jest.fn(),
    };
    handler = new UnlinkGoogleAccountHandler(users as never);
  });

  it('clears the link once the current password is proven', async () => {
    await handler.execute(command());

    expect(users.verifyPassword).toHaveBeenCalledWith(
      USER_ID,
      CURRENT_PASSWORD,
    );
    expect(users.unlinkGoogleAccount).toHaveBeenCalledWith(USER_ID);
  });

  it('rejects an account that has no Google account linked', async () => {
    users.hasLinkedGoogleAccount.mockResolvedValue(false);

    await expect(handler.execute(command())).rejects.toThrow(
      UserHasNoLinkedGoogleAccountError,
    );
    expect(users.verifyPassword).not.toHaveBeenCalled();
    expect(users.unlinkGoogleAccount).not.toHaveBeenCalled();
  });

  it('rejects an account with no password, which would be left unreachable', async () => {
    users.hasPassword.mockResolvedValue(false);

    await expect(handler.execute(command())).rejects.toThrow(
      CannotUnlinkWithoutPasswordError,
    );
    expect(users.verifyPassword).not.toHaveBeenCalled();
    expect(users.unlinkGoogleAccount).not.toHaveBeenCalled();
  });

  it('rejects a wrong current password and leaves the link in place', async () => {
    users.verifyPassword.mockResolvedValue(false);

    await expect(handler.execute(command('WrongP@$$w0rd'))).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(users.unlinkGoogleAccount).not.toHaveBeenCalled();
  });

  it('reports a missing link before a missing password', async () => {
    users.hasLinkedGoogleAccount.mockResolvedValue(false);
    users.hasPassword.mockResolvedValue(false);

    await expect(handler.execute(command())).rejects.toThrow(
      UserHasNoLinkedGoogleAccountError,
    );
  });
});
