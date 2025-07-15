import { Module } from '@nestjs/common';
import { AdsbClient, AdsbClientProvider } from './client/adsb.client';

@Module({
  providers: [AdsbClientProvider],
  exports: [AdsbClient],
})
export class AdsbModule {}
