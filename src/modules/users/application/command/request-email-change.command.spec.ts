import {
  RequestEmailChangeCommand,
  RequestEmailChangeHandler,
} from './request-email-change.command';
import { UserTokenType } from '../../../../../prisma/client/client';
import { EmailChangeRequestedEvent } from '../../../../core/domain/events/dto/user-credentials.events';
import { InvalidCredentialsError } from '../../../auth/model/error/auth.error';
import { PasswordNotSetError } from '../../model/error/user-password.error';
import {
  EmailAlreadyInUseError,
  NewEmailMustDifferError,
} from '../../model/error/user-email.error';

const USER_ID = 'a3d5f9d0-6f8e-4c2b-8f3a-9c1b7e2d4a55';
const CURRENT_EMAIL = 'alan.doe@example.com';
const NEW_EMAIL = 'alan.new@example.com';
const CURRENT_PASSWORD = 'P@$$w0rd';
const RAW_TOKEN = 'wS3xk1Nn7Yc9pQvR2tLmB4dF6hJ8kZgA';

describe('RequestEmailChangeHandler', () => {
  let users: {
    findById: jest.Mock;
    hasPassword: jest.Mock;
    verifyPassword: jest.Mock;
    isEmailTaken: jest.Mock;
  };
  let tokens: { findRecentUnconsumed: jest.Mock; issue: jest.Mock };
  let eventEmitter: { emit: jest.Mock };
  let handler: RequestEmailChangeHandler;

  function command(
    newEmail = NEW_EMAIL,
    currentPassword = CURRENT_PASSWORD,
  ): RequestEmailChangeCommand {
    return new RequestEmailChangeCommand(USER_ID, newEmail, currentPassword);
  }

  beforeEach(() => {
    users = {
      findById: jest.fn().mockResolvedValue({
        id: USER_ID,
        email: CURRENT_EMAIL,
      }),
      hasPassword: jest.fn().mockResolvedValue(true),
      verifyPassword: jest.fn().mockResolvedValue(true),
      isEmailTaken: jest.fn().mockResolvedValue(false),
    };
    tokens = {
      findRecentUnconsumed: jest.fn().mockResolvedValue(null),
      issue: jest
        .fn()
        .mockResolvedValue({ id: 'token-id', rawToken: RAW_TOKEN }),
    };
    eventEmitter = { emit: jest.fn() };
    handler = new RequestEmailChangeHandler(
      users as never,
      tokens as never,
      eventEmitter as never,
    );
  });

  it('issues a 24-hour token carrying the new address and emits the request event', async () => {
    await handler.execute(command());

    expect(tokens.issue).toHaveBeenCalledWith(
      USER_ID,
      UserTokenType.email_change,
      24 * 60 * 60 * 1000,
      NEW_EMAIL,
    );

    const event = eventEmitter.emit.mock
      .calls[0][0] as EmailChangeRequestedEvent;
    expect(event).toBeInstanceOf(EmailChangeRequestedEvent);
    expect(event.payload).toEqual({
      userId: USER_ID,
      currentEmail: CURRENT_EMAIL,
      newEmail: NEW_EMAIL,
      token: RAW_TOKEN,
    });
  });

  it('rejects an account with no password, without touching bcrypt', async () => {
    users.hasPassword.mockResolvedValue(false);

    await expect(handler.execute(command())).rejects.toThrow(
      PasswordNotSetError,
    );
    expect(users.verifyPassword).not.toHaveBeenCalled();
    expect(tokens.issue).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('rejects a wrong current password', async () => {
    users.verifyPassword.mockResolvedValue(false);

    await expect(handler.execute(command())).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(tokens.issue).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('rejects the address the account already uses, ignoring case', async () => {
    await expect(
      handler.execute(command('Alan.Doe@Example.com')),
    ).rejects.toThrow(NewEmailMustDifferError);
    expect(tokens.issue).not.toHaveBeenCalled();
  });

  it('stores and announces the address in its canonical form', async () => {
    await handler.execute(command('Alan.NEW@Example.com'));

    expect(users.isEmailTaken).toHaveBeenCalledWith(NEW_EMAIL, USER_ID);
    expect(tokens.issue).toHaveBeenCalledWith(
      USER_ID,
      UserTokenType.email_change,
      24 * 60 * 60 * 1000,
      NEW_EMAIL,
    );
    const event = eventEmitter.emit.mock
      .calls[0][0] as EmailChangeRequestedEvent;
    expect(event.payload.newEmail).toBe(NEW_EMAIL);
  });

  it('rejects an address held by another account', async () => {
    users.isEmailTaken.mockResolvedValue(true);

    await expect(handler.execute(command())).rejects.toThrow(
      EmailAlreadyInUseError,
    );
    expect(users.isEmailTaken).toHaveBeenCalledWith(NEW_EMAIL, USER_ID);
    expect(tokens.issue).not.toHaveBeenCalled();
  });

  it('suppresses a repeat request made within the five-minute guard', async () => {
    tokens.findRecentUnconsumed.mockResolvedValue({ id: 'pending-token' });

    await expect(handler.execute(command())).resolves.toBeUndefined();

    expect(tokens.findRecentUnconsumed).toHaveBeenCalledWith(
      USER_ID,
      UserTokenType.email_change,
      5 * 60 * 1000,
    );
    expect(tokens.issue).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('checks the password before the address is validated', async () => {
    users.verifyPassword.mockResolvedValue(false);

    await expect(handler.execute(command(CURRENT_EMAIL))).rejects.toThrow(
      InvalidCredentialsError,
    );
  });
});
