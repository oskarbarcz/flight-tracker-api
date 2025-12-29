import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { DiscordMessage } from '../types/discord.types';

@Injectable()
export class DiscordClient {
  protected readonly logger = new Logger(DiscordClient.name);

  constructor(private readonly webhook: string) {}

  async sendMessage(message: DiscordMessage): Promise<void> {
    this.logger.log(
      `Sending Discord ${message.type} message for flight ${message.flightId}`,
    );
    const response = await fetch(this.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message.content }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send message to Discord: ${response.statusText}`,
      );
    }
  }
}

export class TestDiscordClient extends DiscordClient {
  protected readonly logger = new Logger(TestDiscordClient.name);

  override async sendMessage(message: DiscordMessage): Promise<void> {
    this.logger.log(
      `Sending Discord ${message.type} message for flight ${message.flightId}`,
    );
    this.logger.debug(`Message content: \n ${message.content}`);
  }
}

export const DiscordClientProvider = {
  provide: DiscordClient,
  useFactory: (config: ConfigService) => {
    const isProduction = config.get<string>('NODE_ENV') === 'production';
    const webhook = config.get<string>('DISCORD_WEBHOOK_URL') as string;

    return isProduction
      ? new DiscordClient(webhook)
      : new TestDiscordClient(webhook);
  },
  inject: [ConfigService],
};
