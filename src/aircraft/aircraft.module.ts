import { Module } from '@nestjs/common';
import { AircraftService } from './aircraft.service';
import { AircraftController } from './aircraft.controller';

@Module({
  controllers: [AircraftController],
  providers: [AircraftService],
})
export class AircraftModule {}
