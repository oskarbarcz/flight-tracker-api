import { Module } from '@nestjs/common';
import { AircraftModule } from './aircraft/aircraft.module';
import { AirportsModule } from './airports/airports.module';
import { OperatorsModule } from './operators/operators.module';

@Module({
  imports: [AircraftModule, AirportsModule, OperatorsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
