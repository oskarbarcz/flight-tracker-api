import { EmailChangeMailListener } from './email-change-mail.listener';
import { EmailChangeRequestedEvent } from '../../../../../core/domain/events/dto/user-credentials.events';
import {
  MailMessage,
  MailMessageType,
} from '../../../../../core/provider/mailgun/types/mail.types';

const CURRENT_EMAIL = 'alan.doe@example.com';
const NEW_EMAIL = 'alan.new@example.com';
const TOKEN = 'wS3xk1Nn7Yc9pQvR2tLmB4dF6hJ8kZgA';
const FRONTEND_BASE_URL = 'https://app.example.com';

describe('EmailChangeMailListener', () => {
  let mailgun: { send: jest.Mock };
  let listener: EmailChangeMailListener;

  const event = new EmailChangeRequestedEvent({
    userId: '0d1cf1bb-2b6a-4e6a-9e35-4bd23a3a2c3b',
    currentEmail: CURRENT_EMAIL,
    newEmail: NEW_EMAIL,
    token: TOKEN,
  });

  function sentMessages(): MailMessage[] {
    return mailgun.send.mock.calls.map(([message]) => message as MailMessage);
  }

  beforeEach(() => {
    mailgun = { send: jest.fn() };
    listener = new EmailChangeMailListener(
      mailgun as never,
      {
        getOrThrow: () => FRONTEND_BASE_URL,
      } as never,
    );
  });

  it('sends a confirmation to the new address and a notification to the current one', async () => {
    await listener.onEmailChangeRequested(event);

    expect(sentMessages()).toEqual([
      expect.objectContaining({
        to: NEW_EMAIL,
        type: MailMessageType.EmailChangeConfirmation,
      }),
      expect.objectContaining({
        to: CURRENT_EMAIL,
        type: MailMessageType.EmailChangeNotification,
      }),
    ]);
  });

  it('puts the confirmation link only in the message to the new address', async () => {
    await listener.onEmailChangeRequested(event);

    const [confirmation, notification] = sentMessages();

    expect(confirmation.text).toContain(
      `${FRONTEND_BASE_URL}/confirm-email?token=${TOKEN}`,
    );
    expect(notification.text).not.toContain(TOKEN);
    expect(notification.text).not.toContain('/confirm-email');
  });

  it('names the new address in both messages', async () => {
    await listener.onEmailChangeRequested(event);

    for (const message of sentMessages()) {
      expect(message.text).toContain(NEW_EMAIL);
    }
  });

  it('still notifies the current address when the confirmation send fails', async () => {
    mailgun.send.mockRejectedValueOnce(new Error('Mailgun is down'));

    await listener.onEmailChangeRequested(event);

    expect(sentMessages()).toHaveLength(2);
    expect(sentMessages()[1].to).toBe(CURRENT_EMAIL);
  });

  it('does not propagate a failure of the notification send', async () => {
    mailgun.send
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Mailgun is down'));

    await expect(
      listener.onEmailChangeRequested(event),
    ).resolves.toBeUndefined();
  });
});
