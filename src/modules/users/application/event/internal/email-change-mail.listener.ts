import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EmailChangeRequestedEvent,
  UserCredentialsEventType,
} from '../../../../../core/domain/events/dto/user-credentials.events';
import { MailgunClient } from '../../../../../core/provider/mailgun/client/mailgun.client';
import {
  MailMessage,
  MailMessageType,
} from '../../../../../core/provider/mailgun/types/mail.types';
import { getErrorMessage } from '../../../../../core/utils/error-message';

const TOKEN_VALIDITY = '24 hours';

@Injectable()
export class EmailChangeMailListener {
  private readonly logger = new Logger(EmailChangeMailListener.name);
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly mailgun: MailgunClient,
    config: ConfigService,
  ) {
    this.frontendBaseUrl = config.getOrThrow<string>('FRONTEND_BASE_URL');
  }

  @OnEvent(UserCredentialsEventType.EmailChangeRequested)
  async onEmailChangeRequested(
    event: EmailChangeRequestedEvent,
  ): Promise<void> {
    const { currentEmail, newEmail, token } = event.payload;

    await this.send({
      to: newEmail,
      subject: 'Confirm your new email address',
      text: this.confirmationText(newEmail, token),
      type: MailMessageType.EmailChangeConfirmation,
    });

    await this.send({
      to: currentEmail,
      subject: 'Your email address change was requested',
      text: this.notificationText(newEmail),
      type: MailMessageType.EmailChangeNotification,
    });
  }

  private async send(message: MailMessage): Promise<void> {
    try {
      await this.mailgun.send(message);
    } catch (error) {
      this.logger.error(
        `Could not send ${message.type} email: ${getErrorMessage(error)}`,
      );
    }
  }

  private confirmationText(newEmail: string, token: string): string {
    const link = `${this.frontendBaseUrl}/confirm-email?token=${token}`;

    return [
      `A Flight Tracker account asked to move to ${newEmail}.`,
      '',
      'Open the link below to confirm this address. The link works once and',
      `expires in ${TOKEN_VALIDITY}:`,
      '',
      link,
      '',
      'If you did not request this, ignore this message — nothing changes.',
    ].join('\n');
  }

  private notificationText(newEmail: string): string {
    return [
      `Your Flight Tracker account was asked to move to ${newEmail}.`,
      '',
      'The change takes effect only once that address is confirmed from the',
      'message sent to it. Until then you keep signing in with this address.',
      '',
      'If this was not you, change your password now — whoever asked for it',
      'knows your current one.',
    ].join('\n');
  }
}
