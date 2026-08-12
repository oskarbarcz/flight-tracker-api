import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import {
  DiscordDirectMessage,
  DiscordMessage,
  DiscordMessageBase,
} from '../types/discord.types';
import * as path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'node:crypto';
import { getErrorMessage } from '../../../utils/error-message';
import { DiscordGateway } from '../gateway/discord.gateway';

@Injectable()
export class DiscordClient {
  protected readonly logger = new Logger(DiscordClient.name);

  constructor(
    private readonly gateway: DiscordGateway,
    private readonly announcementsChannelId: string,
  ) {}

  async sendMessage(message: DiscordMessage): Promise<void> {
    this.logger.log(
      `Sending Discord ${message.type} message for flight ${message.flightId}`,
    );

    try {
      await this.gateway.sendToChannel(
        this.announcementsChannelId,
        message.content,
      );
    } catch (error) {
      this.logger.error(
        `Error sending Discord ${message.type} message for flight ${message.flightId}: ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async sendDirectMessage(
    memberId: string,
    message: DiscordDirectMessage,
  ): Promise<void> {
    this.logger.log(
      `Sending Discord ${message.type} message for flight ${message.flightId} to member ${memberId}`,
    );

    try {
      await this.gateway.sendToMember(
        memberId,
        message.content,
        message.attachments,
      );
    } catch (error) {
      this.logger.error(
        `Error sending Discord ${message.type} message for flight ${message.flightId} to member ${memberId}: ${getErrorMessage(error)}`,
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

    await this.writeToDisk(message);
  }

  override async sendDirectMessage(
    memberId: string,
    message: DiscordDirectMessage,
  ): Promise<void> {
    this.logger.log(
      `Sending Discord ${message.type} message for flight ${message.flightId} to member ${memberId}`,
    );
    this.logger.debug(`Message content: \n ${message.content}`);

    await this.writeToDisk(message, message.attachments);
  }

  private async writeToDisk(
    message: DiscordMessageBase,
    attachments: string[] = [],
  ): Promise<void> {
    const outputDir = path.join(process.cwd(), 'test-data', 'discord');
    const filePath = path.join(
      outputDir,
      `${message.type}_${message.flightId}.md`,
    );
    const pendingPath = path.join(outputDir, `.pending-${randomUUID()}`);
    const content = [message.content, ...attachments].join('\n');

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(pendingPath, content, { encoding: 'utf-8' });
    await fs.rename(pendingPath, filePath);
  }
}

export const DiscordClientProvider = {
  provide: DiscordClient,
  useFactory: (config: ConfigService, gateway: DiscordGateway) => {
    const isProduction = config.get<string>('NODE_ENV') === 'production';
    const announcementsChannelId = config.getOrThrow<string>(
      'DISCORD_PUBLIC_FLIGHT_ANNOUNCEMENTS_CHANNEL_ID',
    );

    return isProduction
      ? new DiscordClient(gateway, announcementsChannelId)
      : new TestDiscordClient(gateway, announcementsChannelId);
  },
  inject: [ConfigService, DiscordGateway],
};
