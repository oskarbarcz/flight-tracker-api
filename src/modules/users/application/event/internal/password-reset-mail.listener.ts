import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PasswordResetRequestedEvent,
  UserCredentialsEventType,
} from '../../../../../core/domain/events/dto/user-credentials.events';
import { MailgunClient } from '../../../../../core/provider/mailgun/client/mailgun.client';
import { MailMessageType } from '../../../../../core/provider/mailgun/types/mail.types';
import { getErrorMessage } from '../../../../../core/utils/error-message';

const TOKEN_VALIDITY = '1 hour';

@Injectable()
export class PasswordResetMailListener {
  private readonly logger = new Logger(PasswordResetMailListener.name);
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly mailgun: MailgunClient,
    config: ConfigService,
  ) {
    this.frontendBaseUrl = config.getOrThrow<string>('FRONTEND_BASE_URL');
  }

  @OnEvent(UserCredentialsEventType.PasswordResetRequested)
  async onPasswordResetRequested(
    event: PasswordResetRequestedEvent,
  ): Promise<void> {
    const { email, token } = event.payload;

    try {
      await this.mailgun.send({
        to: email,
        subject: 'Reset your password',
        text: this.resetText(token),
        type: MailMessageType.PasswordReset,
      });
    } catch (error) {
      this.logger.error(
        `Could not send password reset email: ${getErrorMessage(error)}`,
      );
    }
  }

  private resetText(token: string): string {
    const link = `${this.frontendBaseUrl}/reset-password?token=${token}`;

    return [
      'Someone asked to reset the password of your MyPreflight account.',
      '',
      'Open the link below to choose a new one. The link works once and',
      `expires in ${TOKEN_VALIDITY}:`,
      '',
      link,
      '',
      'If you did not ask for this, ignore this message — your password stays',
      'as it is.',
    ].join('\n');
  }
}
