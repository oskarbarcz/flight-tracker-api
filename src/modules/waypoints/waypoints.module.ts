import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { WaypointsRepository } from './infra/database/waypoints.repository';
import { GetWaypointHandler } from './application/query/get-waypoint.query';
import { GetWaypointAction } from './infra/http/action/get-waypoint.action';

@Module({
  imports: [PrismaModule],
  controllers: [GetWaypointAction],
  providers: [WaypointsRepository, GetWaypointHandler],
  exports: [WaypointsRepository],
})
export class WaypointsModule {}
