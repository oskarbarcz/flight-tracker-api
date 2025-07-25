import { Module } from '@nestjs/common';
import { SkyLinkClient, SkyLinkClientProvider } from './client/skylink.client';

@Module({
  providers: [SkyLinkClientProvider],
  exports: [SkyLinkClient],
})
export class SkyLinkModule {}
