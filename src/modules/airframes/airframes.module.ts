import { Module } from '@nestjs/common';
import { AirframesController } from './infra/http/controller/airframes.controller';
import { ListAllAirframesHandler } from './application/query/list-all-airframes.query';
import { GetAirframeByTypeHandler } from './application/query/get-airframe-by-type.query';

@Module({
  controllers: [AirframesController],
  providers: [ListAllAirframesHandler, GetAirframeByTypeHandler],
})
export class AirframesModule {}
