import { Module } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AirportsModule } from '../airports/airports.module';
import { FlightsRepository } from './flights.repository';
import { AircraftModule } from '../aircraft/aircraft.module';
import { OperatorsModule } from '../operators/operators.module';

@Module({
  imports: [PrismaModule, AirportsModule, AircraftModule, OperatorsModule],
  controllers: [FlightsController],
  providers: [FlightsService, FlightsRepository],
})
export class FlightsModule {}
