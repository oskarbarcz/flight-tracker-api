import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Client, Guild } from 'discord.js';
import { getErrorMessage } from '../../../utils/error-message';
import {
  DiscordChannelNotFoundError,
  DiscordChannelNotTextBasedError,
  DiscordGatewayDisabledError,
} from '../error/discord.error';
import { GuildMembership } from '../types/discord-identity.types';

const UNKNOWN_MEMBER_ERROR_CODE = 10007;

function isUnknownMemberError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: number }).code === UNKNOWN_MEMBER_ERROR_CODE
  );
}

@Injectable()
export class DiscordGateway implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DiscordGateway.name);
  private readonly enabled: boolean;
  private readonly token: string;
  private readonly serverId: string;

  private connection: Promise<Client> | null = null;
  private client: Client | null = null;

  constructor(config: ConfigService) {
    this.enabled =
      config.get<string>('NODE_ENV') === 'production' ||
      config.get<string>('DISCORD_GATEWAY_ENABLED') === 'true';
    this.token = config.getOrThrow<string>('DISCORD_APP_TOKEN');
    this.serverId = config.getOrThrow<string>('DISCORD_SERVER_ID');
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) {
      this.logger.log(
        'Discord gateway stays offline — set DISCORD_GATEWAY_ENABLED to connect',
      );
      return;
    }

    try {
      await this.connect();
    } catch (error) {
      this.logger.error(
        `Could not reach Discord gateway on startup: ${getErrorMessage(error)}`,
      );
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.connection === null) {
      return;
    }

    const client = await this.connection.catch(() => null);
    this.connection = null;
    this.client = null;

    await client?.destroy();
    this.logger.log('Disconnected from Discord gateway');
  }

  async sendToChannel(channelId: string, content: string): Promise<void> {
    const guild = await this.fetchGuild();
    const channel = await guild.channels.fetch(channelId);

    if (channel === null) {
      throw new DiscordChannelNotFoundError(channelId);
    }

    if (!channel.isTextBased()) {
      throw new DiscordChannelNotTextBasedError(channelId);
    }

    await channel.send({ content });
  }

  async sendToMember(
    memberId: string,
    content: string,
    files: string[] = [],
  ): Promise<void> {
    const guild = await this.fetchGuild();
    const member = await guild.members.fetch(memberId);

    await member.send({ content, files });
  }

  async findMembership(discordId: string): Promise<GuildMembership> {
    try {
      const guild = await this.fetchGuild();
      await guild.members.fetch(discordId);

      return 'member';
    } catch (error) {
      if (isUnknownMemberError(error)) {
        return 'not_member';
      }

      this.logger.warn(
        `Could not resolve Discord membership of ${discordId}: ${getErrorMessage(error)}`,
      );

      return 'unknown';
    }
  }

  private async fetchGuild(): Promise<Guild> {
    const client = await this.connect();

    return client.guilds.fetch(this.serverId);
  }

  private async connect(): Promise<Client> {
    if (!this.enabled) {
      throw new DiscordGatewayDisabledError();
    }

    if (this.client !== null) {
      return this.client;
    }

    if (this.connection === null) {
      this.connection = this.login();
    }

    try {
      this.client = await this.connection;
    } catch (error) {
      this.connection = null;
      throw error;
    }

    return this.client;
  }

  private async login(): Promise<Client> {
    const { Client, GatewayIntentBits } = await import('discord.js');

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    await client.login(this.token);
    this.logger.log('Connected to Discord gateway');

    return client;
  }
}
