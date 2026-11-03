import { Module } from '@nestjs/common';
import {
  OceanicTracksClient,
  OceanicTracksClientProvider,
} from './client/oceanic-tracks.client';

@Module({
  providers: [OceanicTracksClientProvider],
  exports: [OceanicTracksClient],
})
export class OceanicTracksModule {}
