import { Module } from '@nestjs/common';
import { FlightsService } from './service/flights.service';
import { ManagementController } from './controller/management.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AirportsModule } from '../airports/airports.module';
import { FlightsRepository } from './repository/flights.repository';
import { AircraftModule } from '../aircraft/aircraft.module';
import { OperatorsModule } from '../operators/operators.module';
import { EventsController } from './controller/events.controller';
import { ActionsController } from './controller/actions.controller';
import { EventsRepository } from './repository/events.repository';

@Module({
  imports: [PrismaModule, AirportsModule, AircraftModule, OperatorsModule],
  controllers: [ManagementController, EventsController, ActionsController],
  providers: [FlightsService, FlightsRepository, EventsRepository],
})
export class FlightsModule {}
