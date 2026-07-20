import { Module } from '@nestjs/common';
import { SkyLinkModule as SkyLinkClientModule } from '../../core/provider/skylink/skylink.module';
import { GetAirportByIataCodeAction } from './infra/http/action/get-airport-by-iata-code.action';

@Module({
  imports: [SkyLinkClientModule],
  controllers: [GetAirportByIataCodeAction],
  providers: [],
})
export class SkyLinkModule {}
