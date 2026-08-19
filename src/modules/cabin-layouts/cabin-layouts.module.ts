import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { AerolopaModule } from '../../core/provider/aerolopa/aerolopa.module';
import { CabinLayoutsRepository } from './infra/database/repository/cabin-layouts.repository';
import { SyncCabinLayoutsCommandHandler } from './application/command/sync-cabin-layouts.command';
import { ListCabinLayoutsQueryHandler } from './application/query/list-cabin-layouts.query';
import { GetCabinLayoutQueryHandler } from './application/query/get-cabin-layout.query';
import { GetCabinSeatMapQueryHandler } from './application/query/get-cabin-seat-map.query';
import { EnsureCabinLayoutVersionCommandHandler } from './application/command/ensure-cabin-layout-version.command';
import { RefreshCabinLayoutCommandHandler } from './application/command/refresh-cabin-layout.command';
import { SyncCabinLayoutsAction } from './infra/http/action/sync-cabin-layouts.action';
import { ListCabinLayoutsAction } from './infra/http/action/list-cabin-layouts.action';
import { GetCabinLayoutAction } from './infra/http/action/get-cabin-layout.action';
import { GetCabinSeatMapAction } from './infra/http/action/get-cabin-seat-map.action';
import { RefreshCabinLayoutAction } from './infra/http/action/refresh-cabin-layout.action';

@Module({
  imports: [PrismaModule, AerolopaModule],
  controllers: [
    SyncCabinLayoutsAction,
    ListCabinLayoutsAction,
    GetCabinLayoutAction,
    GetCabinSeatMapAction,
    RefreshCabinLayoutAction,
  ],
  providers: [
    CabinLayoutsRepository,
    SyncCabinLayoutsCommandHandler,
    ListCabinLayoutsQueryHandler,
    GetCabinLayoutQueryHandler,
    GetCabinSeatMapQueryHandler,
    EnsureCabinLayoutVersionCommandHandler,
    RefreshCabinLayoutCommandHandler,
  ],
  exports: [CabinLayoutsRepository],
})
export class CabinLayoutsModule {}
