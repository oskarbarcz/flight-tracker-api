import { Module } from '@nestjs/common';
import { OsmClient, OsmClientProvider } from './client/osm.client';

@Module({
  providers: [OsmClientProvider],
  exports: [OsmClient],
})
export class OsmModule {}
