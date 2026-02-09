import { Module } from '@nestjs/common';
import { ManagementController } from './controller/management.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { FlightsRepository } from './repository/flights.repository';
import { EventsController } from './controller/events.controller';
import { ActionsController } from './controller/actions.controller';
import { EventsRepository } from './repository/events.repository';
import { PositionService } from './service/position.service';
import { AdsbModule } from '../../core/provider/adsb/adsb.module';
import { PathController } from './controller/path.controller';
import { DiversionRepository } from './repository/diversion.repository';
import { DiversionController } from './controller/diversion.controller';
import { DiscordService } from './service/discord.service';
import { DiscordModule } from '../../core/provider/discord/discord.module';
import { MarkFlightAsReadyHandler } from './application/command/mark-as-ready.command';
import { GetFlightByIdHandler } from './application/query/get-flight-by-id.query';
import { ListAllFlightsHandler } from './application/query/list-all-flights.query';
import { RemoveFlightHandler } from './application/command/remove-flight.command';
import { CheckInPilotForFlightHandler } from './application/command/check-in-pilot.command';
import { StartBoardingHandler } from './application/command/start-boarding.command';
import { FinishBoardingHandler } from './application/command/finish-boarding.command';
import { ReportOffBlockHandler } from './application/command/report-off-block.command';
import { ReportTakeoffHandler } from './application/command/report-takeoff.command';
import { ReportArrivalHandler } from './application/command/report-arrival.command';
import { ReportOnBlockHandler } from './application/command/report-on-block.command';
import { FinishOffboardingHandler } from './application/command/finish-offboarding.command';
import { StartOffboardingHandler } from './application/command/start-offboarding.command';
import { UpdatePreliminaryLoadsheetHandler } from './application/command/update-preliminary-loadsheet.command';
import { CloseFlightHandler } from './application/command/close-flight.command';
import { UpdateScheduledTimesheetHandler } from './application/command/update-scheduled-timesheet.command';
import { CreateFlightHandler } from './application/command/create-flight.command';
import { CheckFlightExistsHandler } from './application/query/check-flight-exists.query';
import { GetFlightRotationInfoHandler } from './application/query/get-flight-rotation-info.query';
import { SimbriefModule } from '../../core/provider/simbrief/simbrief.module';
import { CreateFlightFromSimbriefHandler } from './application/command/create-flight-from-simbrief.command';
import { OfpController } from './controller/ofp.controller';
import { GetOfpByFlightIdHandler } from './application/query/get-ofp-by-flight-id.query';
import { GetFlightPathHandler } from './application/query/get-flight-path.query';
import { GetFlightTrackingHandler } from './application/query/get-flight-tracking.query';
import { ChangeFlightVisibilityHandler } from './application/command/change-flight-visibility.command';

@Module({
  imports: [PrismaModule, DiscordModule, AdsbModule, SimbriefModule],
  controllers: [
    ManagementController,
    EventsController,
    DiversionController,
    OfpController,
    ActionsController,
    PathController,
  ],
  providers: [
    PositionService,
    DiscordService,
    FlightsRepository,
    EventsRepository,
    DiversionRepository,
    MarkFlightAsReadyHandler,
    GetFlightByIdHandler,
    ListAllFlightsHandler,
    RemoveFlightHandler,
    CheckInPilotForFlightHandler,
    StartBoardingHandler,
    FinishBoardingHandler,
    ReportOffBlockHandler,
    ReportTakeoffHandler,
    ReportArrivalHandler,
    ReportOnBlockHandler,
    StartOffboardingHandler,
    FinishOffboardingHandler,
    UpdatePreliminaryLoadsheetHandler,
    UpdateScheduledTimesheetHandler,
    CloseFlightHandler,
    CreateFlightHandler,
    CreateFlightFromSimbriefHandler,
    CheckFlightExistsHandler,
    GetFlightRotationInfoHandler,
    GetOfpByFlightIdHandler,
    GetFlightPathHandler,
    GetFlightTrackingHandler,
    ChangeFlightVisibilityHandler,
  ],
})
export class FlightsModule {}
