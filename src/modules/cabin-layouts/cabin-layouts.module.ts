import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { AerolopaModule } from '../../core/provider/aerolopa/aerolopa.module';
import { CabinLayoutsRepository } from './infra/database/repository/cabin-layouts.repository';
import { SyncCabinLayoutsCommandHandler } from './application/command/sync-cabin-layouts.command';
import { ListCabinLayoutsQueryHandler } from './application/query/list-cabin-layouts.query';
import { GetCabinLayoutQueryHandler } from './application/query/get-cabin-layout.query';
import { SyncCabinLayoutsAction } from './infra/http/action/sync-cabin-layouts.action';
import { ListCabinLayoutsAction } from './infra/http/action/list-cabin-layouts.action';
import { GetCabinLayoutAction } from './infra/http/action/get-cabin-layout.action';

@Module({
  imports: [PrismaModule, AerolopaModule],
  controllers: [
    SyncCabinLayoutsAction,
    ListCabinLayoutsAction,
    GetCabinLayoutAction,
  ],
  providers: [
    CabinLayoutsRepository,
    SyncCabinLayoutsCommandHandler,
    ListCabinLayoutsQueryHandler,
    GetCabinLayoutQueryHandler,
  ],
  exports: [CabinLayoutsRepository],
})
export class CabinLayoutsModule {}
