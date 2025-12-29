import { Module } from '@nestjs/common';
import { DiscordClient, DiscordClientProvider } from './client/discord.client';

@Module({
  providers: [DiscordClientProvider],
  exports: [DiscordClient],
})
export class DiscordModule {}
