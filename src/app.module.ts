import { Module } from '@nestjs/common';
import { AirportsModule } from './modules/airports/airports.module';
import { AirframesModule } from './modules/airframes/airframes.module';
import { OperatorsModule } from './modules/operators/operators.module';
import { FlightsModule } from './modules/flights/flights.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SkyLinkModule } from './modules/skylink/skylink.module';
import { CacheModule } from '@nestjs/cache-manager';
import { DiscordModule } from './core/provider/discord/discord.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    AirportsModule,
    AirframesModule,
    OperatorsModule,
    FlightsModule,
    AutomationsModule,
    UsersModule,
    AuthModule,
    JwtModule,
    SkyLinkModule,
    DiscordModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
  ],
})
export class AppModule {}
