import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'node:crypto';
import { MailMessage } from '../types/mail.types';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';

@Injectable()
export class MailgunClient {
  protected readonly logger = new Logger(MailgunClient.name);

  constructor(
    private readonly baseUrl: string,
    private readonly domain: string,
    private readonly apiKey: string,
    private readonly sender: string,
  ) {}

  async send(message: MailMessage): Promise<void> {
    this.logger.log(`Sending ${message.type} email to ${message.to}`);

    const url = `${this.baseUrl}/v3/${this.domain}/messages`;
    const credentials = Buffer.from(`api:${this.apiKey}`).toString('base64');
    const body = new URLSearchParams({
      from: this.sender,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error(
        `Error sending ${message.type} email to ${message.to}: ${errorMessage}`,
      );
      throw error;
    }
  }
}

export class TestMailgunClient extends MailgunClient {
  protected readonly logger = new Logger(TestMailgunClient.name);

  override async send(message: MailMessage): Promise<void> {
    this.logger.log(`Sending ${message.type} email to ${message.to}`);

    const outputDir = path.join(process.cwd(), 'test-data', 'mail');
    const filePath = path.join(
      outputDir,
      `${message.type}_${message.to}_${randomUUID()}.json`,
    );
    const pendingPath = path.join(outputDir, `.pending-${randomUUID()}`);
    const content = {
      to: message.to,
      subject: message.subject,
      text: message.text,
    };

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(pendingPath, JSON.stringify(content, null, 2), {
      encoding: 'utf-8',
    });
    await fs.rename(pendingPath, filePath);
  }
}

export const MailgunClientProvider = {
  provide: MailgunClient,
  useFactory: (config: ConfigService) => {
    const isProduction = config.get<string>('NODE_ENV') === 'production';
    const baseUrl = config.getOrThrow<string>('MAILGUN_API_HOST');
    const domain = config.getOrThrow<string>('MAILGUN_DOMAIN');
    const apiKey = config.getOrThrow<string>('MAILGUN_API_KEY');
    const sender = config.getOrThrow<string>('MAIL_FROM_ADDRESS');

    return isProduction
      ? new MailgunClient(baseUrl, domain, apiKey, sender)
      : new TestMailgunClient(baseUrl, domain, apiKey, sender);
  },
  inject: [ConfigService],
};
