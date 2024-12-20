import { Module } from '@nestjs/common';
import { AircraftModule } from './aircraft/aircraft.module';
import { AirportsModule } from './airports/airports.module';
import { OperatorsModule } from './operators/operators.module';
import { FlightsModule } from './flights/flights.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AircraftModule,
    AirportsModule,
    OperatorsModule,
    FlightsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
