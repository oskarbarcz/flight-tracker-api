import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { StatisticsRepository } from './infra/database/statistics.repository';
import { RecomputeUserStatisticsHandler } from './application/command/recompute-user-statistics.command';
import { FlightCompletionListener } from './application/event/external/flight-completion.listener';
import { GetUserLifetimeStatsHandler } from './application/query/get-user-lifetime-stats.query';
import { GetUserStatsSummaryHandler } from './application/query/get-user-stats-summary.query';
import { GetAircraftTypeStatsHandler } from './application/query/get-aircraft-type-stats.query';
import { GetPeriodStatsHandler } from './application/query/get-period-stats.query';
import { GetActivityHandler } from './application/query/get-activity.query';
import { GetMyStatsAction } from './infra/http/action/get-my-stats.action';
import { GetMyStatsSummaryAction } from './infra/http/action/get-my-stats-summary.action';
import { GetMyAircraftTypeStatsAction } from './infra/http/action/get-my-aircraft-type-stats.action';
import { GetMyPeriodStatsAction } from './infra/http/action/get-my-period-stats.action';
import { GetMyActivityAction } from './infra/http/action/get-my-activity.action';

@Module({
  controllers: [
    GetMyStatsAction,
    GetMyStatsSummaryAction,
    GetMyAircraftTypeStatsAction,
    GetMyPeriodStatsAction,
    GetMyActivityAction,
  ],
  providers: [
    StatisticsRepository,
    RecomputeUserStatisticsHandler,
    FlightCompletionListener,
    GetUserLifetimeStatsHandler,
    GetUserStatsSummaryHandler,
    GetAircraftTypeStatsHandler,
    GetPeriodStatsHandler,
    GetActivityHandler,
  ],
  imports: [PrismaModule],
})
export class StatisticsModule {}
