import { Module } from '@nestjs/common';
import { AircraftModule } from './aircraft/aircraft.module';

@Module({
  imports: [AircraftModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
