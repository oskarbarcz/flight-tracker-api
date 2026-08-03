import { PasswordResetMailListener } from './password-reset-mail.listener';
import { PasswordResetRequestedEvent } from '../../../../../core/domain/events/dto/user-credentials.events';
import {
  MailMessage,
  MailMessageType,
} from '../../../../../core/provider/mailgun/types/mail.types';

const EMAIL = 'operations@example.com';
const TOKEN = 'wS3xk1Nn7Yc9pQvR2tLmB4dF6hJ8kZgA';
const FRONTEND_BASE_URL = 'https://app.example.com';

describe('PasswordResetMailListener', () => {
  let mailgun: { send: jest.Mock };
  let listener: PasswordResetMailListener;

  const event = new PasswordResetRequestedEvent({
    userId: '0d1cf1bb-2b6a-4e6a-9e35-4bd23a3a2c3b',
    email: EMAIL,
    token: TOKEN,
  });

  function sentMessage(): MailMessage {
    return mailgun.send.mock.calls[0][0] as MailMessage;
  }

  beforeEach(() => {
    mailgun = { send: jest.fn() };
    listener = new PasswordResetMailListener(
      mailgun as never,
      {
        getOrThrow: () => FRONTEND_BASE_URL,
      } as never,
    );
  });

  it('sends a reset link to the account address', async () => {
    await listener.onPasswordResetRequested(event);

    expect(sentMessage()).toEqual({
      to: EMAIL,
      subject: 'Reset your password',
      text: expect.stringContaining(
        `${FRONTEND_BASE_URL}/reset-password?token=${TOKEN}`,
      ),
      type: MailMessageType.PasswordReset,
    });
  });

  it('states how long the link stays usable', async () => {
    await listener.onPasswordResetRequested(event);

    expect(sentMessage().text).toContain('1 hour');
  });

  it('does not propagate a failure of the send', async () => {
    mailgun.send.mockRejectedValue(new Error('Mailgun is down'));

    await expect(
      listener.onPasswordResetRequested(event),
    ).resolves.toBeUndefined();
  });
});
