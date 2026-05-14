import { Module } from '@nestjs/common';
import { ManagementController } from './infra/http/controller/management.controller';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { FlightsRepository } from './infra/database/repository/flights.repository';
import { EventsController } from './infra/http/controller/events.controller';
import { ActionsController } from './infra/http/controller/actions.controller';
import { EventsRepository } from './infra/database/repository/events.repository';
import { PositionService } from './infra/service/position.service';
import { AdsbModule } from '../../core/provider/adsb/adsb.module';
import { PathController } from './infra/http/controller/path.controller';
import { DiversionRepository } from './infra/database/repository/diversion.repository';
import { DiversionController } from './infra/http/controller/diversion.controller';
import { EmergencyRepository } from './infra/database/repository/emergency.repository';
import { EmergencyController } from './infra/http/controller/emergency.controller';
import { DeclareEmergencyHandler } from './application/command/emergency/declare-emergency.command';
import { UpdateEmergencyHandler } from './application/command/emergency/update-emergency.command';
import { ResolveEmergencyHandler } from './application/command/emergency/resolve-emergency.command';
import { ListEmergenciesHandler } from './application/query/emergency/list-emergencies.query';
import { DiscordService } from './infra/service/discord.service';
import { DiscordModule } from '../../core/provider/discord/discord.module';
import { MarkFlightAsReadyHandler } from './application/command/mark-as-ready.command';
import { GetFlightHandler } from './application/query/get-flight.query';
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
import { UpdatePredictedTimesheetHandler } from './application/command/update-predicted-timesheet.command';
import { CreateFlightHandler } from './application/command/create-flight.command';
import { SimbriefModule } from '../../core/provider/simbrief/simbrief.module';
import { CreateFlightFromSimbriefHandler } from './application/command/create-flight-from-simbrief.command';
import { OfpController } from './infra/http/controller/ofp.controller';
import { GetOfpHandler } from './application/query/get-ofp.query';
import { GetPathHandler } from './application/query/path/get-path.query';
import { GetFlightTrackingHandler } from './application/query/get-flight-tracking.query';
import { ChangeFlightVisibilityHandler } from './application/command/change-flight-visibility.command';
import { UpdateDepartureGateHandler } from './application/command/update-departure-gate.command';
import { UpdateDepartureRunwayHandler } from './application/command/update-departure-runway.command';
import { UpdateArrivalGateHandler } from './application/command/update-arrival-gate.command';
import { UpdateArrivalRunwayHandler } from './application/command/update-arrival-runway.command';
import { AddFlightToRotationHandler } from './application/command/rotation/add-flight-to-rotation.command';
import { RemoveFlightFromRotationHandler } from './application/command/rotation/remove-flight-from-rotation.command';
import { RotationsController } from './infra/http/controller/rotations.controller';
import { ListEventsHandler } from './application/query/events/list-events.query';
import { GetDiversionHandler } from './application/query/diversion/get-diversion.query';
import { ReportFlightDiversionHandler } from './application/command/diversion/report-flight-diversion.command';

@Module({
  imports: [PrismaModule, DiscordModule, AdsbModule, SimbriefModule],
  controllers: [
    ManagementController,
    EventsController,
    DiversionController,
    EmergencyController,
    OfpController,
    ActionsController,
    PathController,
    RotationsController,
  ],
  providers: [
    PositionService,
    DiscordService,
    FlightsRepository,
    EventsRepository,
    DiversionRepository,
    EmergencyRepository,
    DeclareEmergencyHandler,
    UpdateEmergencyHandler,
    ResolveEmergencyHandler,
    ListEmergenciesHandler,
    MarkFlightAsReadyHandler,
    GetFlightHandler,
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
    UpdatePredictedTimesheetHandler,
    CloseFlightHandler,
    CreateFlightHandler,
    CreateFlightFromSimbriefHandler,
    GetOfpHandler,
    GetPathHandler,
    GetFlightTrackingHandler,
    ChangeFlightVisibilityHandler,
    UpdateDepartureGateHandler,
    UpdateDepartureRunwayHandler,
    UpdateArrivalGateHandler,
    UpdateArrivalRunwayHandler,
    AddFlightToRotationHandler,
    RemoveFlightFromRotationHandler,
    ListEventsHandler,
    GetDiversionHandler,
    ReportFlightDiversionHandler,
  ],
})
export class FlightsModule {}
