import { Module } from '@nestjs/common';
import { AirportsModule } from './modules/airports/airports.module';
import { AirframesModule } from './modules/airframes/airframes.module';
import { OperatorsModule } from './modules/operators/operators.module';
import { RotationsModule } from './modules/rotations/rotations.module';
import { FlightsModule } from './modules/flights/flights.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { UsersModule } from './modules/users/users.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SkyLinkModule } from './modules/skylink/skylink.module';
import { CacheModule } from '@nestjs/cache-manager';
import { DiscordModule } from './core/provider/discord/discord.module';
import { CqrsModule } from '@nestjs/cqrs';
import { DomainEventsModule } from './core/domain/events/domain-events.module';

// Scheduled (@Cron) jobs run against the live database. On the local/dev env
// they race the functional suite's TRUNCATE-based reset and cause deadlocks,
// so the scheduler is opt-out there via SCHEDULER_ENABLED=false. It defaults
// to enabled everywhere else.
const schedulerEnabled = process.env.SCHEDULER_ENABLED !== 'false';

@Module({
  imports: [
    AirportsModule,
    AirframesModule,
    OperatorsModule,
    RotationsModule,
    FlightsModule,
    AutomationsModule,
    UsersModule,
    StatisticsModule,
    AuthModule,
    JwtModule,
    SkyLinkModule,
    DiscordModule,
    EventEmitterModule.forRoot(),
    DomainEventsModule,
    ...(schedulerEnabled ? [ScheduleModule.forRoot()] : []),
    CqrsModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
  ],
})
export class AppModule {}
