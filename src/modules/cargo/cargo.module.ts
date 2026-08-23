import { Module } from '@nestjs/common';
import { ListHoldLayoutsAction } from './infra/http/action/list-hold-layouts.action';
import { GetHoldLayoutAction } from './infra/http/action/get-hold-layout.action';
import { ListHoldLayoutsHandler } from './application/query/list-hold-layouts.query';
import { GetHoldLayoutHandler } from './application/query/get-hold-layout.query';

@Module({
  controllers: [ListHoldLayoutsAction, GetHoldLayoutAction],
  providers: [ListHoldLayoutsHandler, GetHoldLayoutHandler],
})
export class CargoModule {}
