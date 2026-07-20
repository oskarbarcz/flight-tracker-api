import { Module } from '@nestjs/common';
import { ListAllAirframesAction } from './infra/http/action/list-all-airframes.action';
import { GetAirframeByTypeAction } from './infra/http/action/get-airframe-by-type.action';
import { ListAllAirframesHandler } from './application/query/list-all-airframes.query';
import { GetAirframeByTypeHandler } from './application/query/get-airframe-by-type.query';

@Module({
  controllers: [ListAllAirframesAction, GetAirframeByTypeAction],
  providers: [ListAllAirframesHandler, GetAirframeByTypeHandler],
})
export class AirframesModule {}
