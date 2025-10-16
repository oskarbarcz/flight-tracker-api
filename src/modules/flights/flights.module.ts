import { Module } from '@nestjs/common';
import { FlightsService } from './service/flights.service';
import { ManagementController } from './controller/management.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { FlightsRepository } from './repository/flights.repository';
import { AircraftModule } from '../aircraft/aircraft.module';
import { OperatorsModule } from '../operators/operators.module';
import { EventsController } from './controller/events.controller';
import { ActionsController } from './controller/actions.controller';
import { EventsRepository } from './repository/events.repository';
import { PositionService } from './service/position.service';
import { AdsbModule } from '../../core/provider/adsb/adsb.module';
import { PathController } from './controller/path.controller';
import { DiversionRepository } from './repository/diversion.repository';
import { DiversionController } from './controller/diversion.controller';

@Module({
  imports: [PrismaModule, AircraftModule, OperatorsModule, AdsbModule],
  controllers: [
    ManagementController,
    EventsController,
    DiversionController,
    ActionsController,
    PathController,
  ],
  providers: [
    FlightsService,
    PositionService,
    FlightsRepository,
    EventsRepository,
    DiversionRepository,
  ],
})
export class FlightsModule {}
