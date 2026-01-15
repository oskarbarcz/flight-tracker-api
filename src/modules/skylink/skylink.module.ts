import { Module } from '@nestjs/common';
import { SkyLinkModule as SkyLinkClientModule } from '../../core/provider/skylink/skylink.module';
import { SkyLinkController } from './skylink.controller';

@Module({
  imports: [SkyLinkClientModule],
  controllers: [SkyLinkController],
  providers: [],
})
export class SkyLinkModule {}
