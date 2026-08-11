import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { DiscordMessage } from '../types/discord.types';
import * as path from 'path';
import { promises as fs } from 'fs';
import { getErrorMessage } from '../../../utils/error-message';
import { fetchWithRetry } from '../../http/fetch-with-retry';
import { Client, GatewayIntentBits } from 'discord.js';

let client: Client | null = null;

async function getClient(): Promise<Client> {
  if (client !== null) {
    return client;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  await client.login(process.env.DISCORD_APP_TOKEN);

  return client;
}

@Injectable()
export class DiscordClient {
  protected readonly logger = new Logger(DiscordClient.name);

  constructor(private readonly webhook: string) {}

  async sendMessage(message: DiscordMessage): Promise<void> {
    this.logger.log(
      `Sending Discord ${message.type} message for flight ${message.flightId}`,
    );

    const client: Client = await getClient();
    const serverId = '1398051941354963004';
    const memberId = '1180928122535817350';
    const guild = await client.guilds.fetch(serverId);
    const member = await guild.members.fetch(memberId);
    try {
      await member.send({
        content:
          'text [link to file plan](https://www.simbrief.com/ofp/flightplans/VHHHOMDB_PDF_1786374978.pdf)',
        files: [
          'https://www.simbrief.com/ofp/flightplans/VHHHOMDB_PDF_1786374978.pdf',
        ],
      });
    } catch (e) {
      console.log('cannot send priv msg', e);
    }

    try {
      const response = await fetchWithRetry(this.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message.content }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to send message to Discord: ${response.statusText}`,
        );
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error(
        `Error sending Discord ${message.type} message for flight ${message.flightId}: ${errorMessage}`,
      );
      throw error;
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

    const client: Client = await getClient();
    const serverId = '1398051941354963004';
    const memberId = '1180928122535817350';
    const guild = await client.guilds.fetch(serverId);
    const member = await guild.members.fetch(memberId);
    try {
      await member.send({
        content:
          'text [link to file plan](https://www.simbrief.com/ofp/flightplans/VHHHOMDB_PDF_1786374978.pdf)',
        files: [
          'https://www.simbrief.com/ofp/flightplans/VHHHOMDB_PDF_1786374978.pdf',
        ],
      });
    } catch (e) {
      console.log('cannot send priv msg', e);
    }

    const channel = await guild.channels.fetch('1454862005142818836');
    if (channel && channel.isTextBased()) {
      await channel.send(message.content);
    }

    const outputDir = path.join(process.cwd(), 'test-data', 'discord');
    const filePath = path.join(
      outputDir,
      `${message.type}_${message.flightId}.md`,
    );
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, message.content, { encoding: 'utf-8' });
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
