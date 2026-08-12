import { Module } from '@nestjs/common';
import { DiscordClient, DiscordClientProvider } from './client/discord.client';
import { DiscordGateway } from './gateway/discord.gateway';

@Module({
  providers: [DiscordGateway, DiscordClientProvider],
  exports: [DiscordClient],
})
export class DiscordModule {}
