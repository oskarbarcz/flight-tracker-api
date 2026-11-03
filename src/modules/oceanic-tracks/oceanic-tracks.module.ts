import { Module } from '@nestjs/common';
import { OceanicTracksModule as OceanicTracksClientModule } from '../../core/provider/oceanic-tracks/oceanic-tracks.module';
import { GetCurrentOceanicTracksAction } from './infra/http/action/get-current-oceanic-tracks.action';
import { GetCurrentOceanicTracksHandler } from './application/query/get-current-oceanic-tracks.query';

@Module({
  imports: [OceanicTracksClientModule],
  controllers: [GetCurrentOceanicTracksAction],
  providers: [GetCurrentOceanicTracksHandler],
})
export class OceanicTracksModule {}
