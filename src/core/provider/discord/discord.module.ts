import { Module } from '@nestjs/common';
import { DiscordClient, DiscordClientProvider } from './client/discord.client';
import {
  DiscordIdentityClient,
  DiscordIdentityClientProvider,
} from './client/discord-identity.client';
import { DiscordGateway } from './gateway/discord.gateway';

@Module({
  providers: [
    DiscordGateway,
    DiscordClientProvider,
    DiscordIdentityClientProvider,
  ],
  exports: [DiscordClient, DiscordIdentityClient, DiscordGateway],
})
export class DiscordModule {}
