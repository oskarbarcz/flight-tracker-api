import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { fetchWithRetry } from '../../http/fetch-with-retry';
import { getErrorMessage } from '../../../utils/error-message';
import {
  DiscordAuthorization,
  DiscordIdentity,
  GuildJoinOutcome,
} from '../types/discord-identity.types';
import {
  DiscordRedirectUriNotAllowedError,
  DiscordUnreachableError,
  InvalidDiscordAuthorizationCodeError,
} from '../error/discord-identity.error';

const DEFAULT_DISCORD_API_HOST = 'https://discord.com/api';

export type DiscordIdentityClientConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  allowedRedirectUris: string[];
  serverId: string;
  botToken: string;
};

type TokenResponse = {
  access_token?: string;
  scope?: string;
};

type CurrentUserResponse = {
  id?: string;
  username?: string;
  global_name?: string | null;
  avatar?: string | null;
};

@Injectable()
export class DiscordIdentityClient {
  private readonly logger = new Logger(DiscordIdentityClient.name);

  constructor(private readonly config: DiscordIdentityClientConfig) {}

  async exchangeCode(
    code: string,
    redirectUri: string,
    codeVerifier: string,
  ): Promise<DiscordAuthorization> {
    this.assertRedirectUriIsAllowed(redirectUri);

    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await this.request('/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (response.status >= 500) {
      this.logger.error(
        `Discord token endpoint responded ${response.status.toString()}`,
      );

      throw new DiscordUnreachableError();
    }

    if (!response.ok) {
      this.logger.warn(
        `Discord rejected the authorization code with ${response.status.toString()}`,
      );

      throw new InvalidDiscordAuthorizationCodeError();
    }

    const payload = (await response.json()) as TokenResponse;

    if (!payload.access_token) {
      throw new InvalidDiscordAuthorizationCodeError();
    }

    return {
      accessToken: payload.access_token,
      scopes: (payload.scope ?? '')
        .split(' ')
        .filter((scope) => scope.length > 0),
    };
  }

  async getCurrentUser(accessToken: string): Promise<DiscordIdentity> {
    const response = await this.request('/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      this.logger.error(
        `Discord user endpoint responded ${response.status.toString()}`,
      );

      throw new DiscordUnreachableError();
    }

    const payload = (await response.json()) as CurrentUserResponse;

    if (!payload.id || !payload.username) {
      this.logger.error('Discord user endpoint returned an incomplete profile');

      throw new DiscordUnreachableError();
    }

    return {
      discordId: payload.id,
      username: payload.username,
      globalName: payload.global_name ?? null,
      avatar: payload.avatar ?? null,
    };
  }

  async addGuildMember(
    discordId: string,
    accessToken: string,
  ): Promise<GuildJoinOutcome> {
    const path = `/guilds/${this.config.serverId}/members/${discordId}`;

    try {
      const response = await this.request(path, {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${this.config.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      if (response.status === 201) {
        return 'joined';
      }

      if (response.status === 204) {
        return 'already_member';
      }

      this.logger.error(
        `Discord refused to add member ${discordId} to the server: ${response.status.toString()}`,
      );

      return 'failed';
    } catch (error) {
      this.logger.error(
        `Could not add member ${discordId} to the Discord server: ${getErrorMessage(error)}`,
      );

      return 'failed';
    }
  }

  private assertRedirectUriIsAllowed(redirectUri: string): void {
    if (!this.config.allowedRedirectUris.includes(redirectUri)) {
      this.logger.warn(`Rejected Discord redirect URI ${redirectUri}`);

      throw new DiscordRedirectUriNotAllowedError();
    }
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    try {
      return await fetchWithRetry(`${this.config.baseUrl}${path}`, init);
    } catch (error) {
      this.logger.error(
        `Discord request to ${path} failed: ${getErrorMessage(error)}`,
      );

      throw new DiscordUnreachableError();
    }
  }
}

export function parseAllowedRedirectUris(value: string): string[] {
  return value
    .split(',')
    .map((uri) => uri.trim())
    .filter((uri) => uri.length > 0);
}

export const DiscordIdentityClientProvider = {
  provide: DiscordIdentityClient,
  useFactory: (config: ConfigService) =>
    new DiscordIdentityClient({
      baseUrl:
        config.get<string>('DISCORD_API_HOST') ?? DEFAULT_DISCORD_API_HOST,
      clientId: config.getOrThrow<string>('DISCORD_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('DISCORD_CLIENT_SECRET'),
      allowedRedirectUris: parseAllowedRedirectUris(
        config.getOrThrow<string>('DISCORD_OAUTH_REDIRECT_URIS'),
      ),
      serverId: config.getOrThrow<string>('DISCORD_SERVER_ID'),
      botToken: config.getOrThrow<string>('DISCORD_APP_TOKEN'),
    }),
  inject: [ConfigService],
};
