import { Module } from '@nestjs/common';
import {
  PostcardClient,
  PostcardClientProvider,
} from './client/postcard.client';

@Module({
  providers: [PostcardClientProvider],
  exports: [PostcardClient],
})
export class PostcardModule {}
