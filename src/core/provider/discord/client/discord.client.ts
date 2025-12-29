import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DiscordClient {
  protected readonly logger = new Logger(DiscordClient.name);

  constructor(private readonly webhook: string) {}

  async sendMessage(flightId: string, content: string): Promise<void> {
    this.logger.log(`Sending Discord message for flight ${flightId}`);
    const response = await fetch(this.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
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

  override async sendMessage(flightId: string, message: string): Promise<void> {
    this.logger.log(`Sending Discord message: ${flightId}`);
    this.logger.debug(`Message content: \n ${message}`);
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
