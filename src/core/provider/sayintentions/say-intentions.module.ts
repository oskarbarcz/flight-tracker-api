import { Module } from '@nestjs/common';
import {
  SayIntentionsClient,
  SayIntentionsClientProvider,
} from './client/say-intentions.client';

@Module({
  providers: [SayIntentionsClientProvider],
  exports: [SayIntentionsClient],
})
export class SayIntentionsModule {}
