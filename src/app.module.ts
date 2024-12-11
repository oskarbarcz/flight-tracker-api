import { Module } from '@nestjs/common';
import { AircraftModule } from './aircraft/aircraft.module';
import { AirportsModule } from './airports/airports.module';

@Module({
  imports: [AircraftModule, AirportsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
