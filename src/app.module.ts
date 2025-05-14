import { Module } from '@nestjs/common';
import { AircraftModule } from './aircraft/aircraft.module';
import { AirportsModule } from './airports/airports.module';
import { OperatorsModule } from './operators/operators.module';
import { FlightsModule } from './flights/flights.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RotationsModule } from './rotations/rotations.module';

@Module({
  imports: [
    AircraftModule,
    AirportsModule,
    OperatorsModule,
    FlightsModule,
    UsersModule,
    AuthModule,
    JwtModule,
    RotationsModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
