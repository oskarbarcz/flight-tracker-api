import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { AdsbModule } from '../../core/provider/adsb/adsb.module';
import { DiscordModule } from '../../core/provider/discord/discord.module';
import { SimbriefModule } from '../../core/provider/simbrief/simbrief.module';

import { FlightsRepository } from './infra/database/repository/flights.repository';
import { EventsRepository } from './infra/database/repository/events.repository';
import { DiversionRepository } from './infra/database/repository/diversion.repository';
import { EmergencyRepository } from './infra/database/repository/emergency.repository';
import { PositionService } from './infra/service/position.service';
import { DiscordService } from './infra/service/discord.service';

// flight CRUD
import { CreateFlightAction } from './infra/http/action/flight/create-flight.action';
import { CreateFlightFromSimbriefAction } from './infra/http/action/flight/create-flight-from-simbrief.action';
import { ListFlightsAction } from './infra/http/action/flight/list-flights.action';
import { GetFlightAction } from './infra/http/action/flight/get-flight.action';
import { RemoveFlightAction } from './infra/http/action/flight/remove-flight.action';
// loadsheet
import { UpdatePreliminaryLoadsheetAction } from './infra/http/action/loadsheet/update-preliminary-loadsheet.action';
// timesheet
import { UpdateScheduledTimesheetAction } from './infra/http/action/timesheet/update-scheduled-timesheet.action';
import { UpdatePredictedTimesheetAction } from './infra/http/action/timesheet/update-predicted-timesheet.action';
// tracking
import { ChangeFlightVisibilityAction } from './infra/http/action/tracking/change-flight-visibility.action';
// gate
import { UpdateDepartureGateAction } from './infra/http/action/gate/update-departure-gate.action';
import { UpdateArrivalGateAction } from './infra/http/action/gate/update-arrival-gate.action';
// runway
import { UpdateDepartureRunwayAction } from './infra/http/action/runway/update-departure-runway.action';
import { UpdateArrivalRunwayAction } from './infra/http/action/runway/update-arrival-runway.action';
// lifecycle
import { MarkFlightAsReadyAction } from './infra/http/action/lifecycle/mark-flight-as-ready.action';
import { CheckInPilotAction } from './infra/http/action/lifecycle/check-in-pilot.action';
import { StartBoardingAction } from './infra/http/action/lifecycle/start-boarding.action';
import { FinishBoardingAction } from './infra/http/action/lifecycle/finish-boarding.action';
import { ReportOffBlockAction } from './infra/http/action/lifecycle/report-off-block.action';
import { ReportTakeoffAction } from './infra/http/action/lifecycle/report-takeoff.action';
import { ReportArrivalAction } from './infra/http/action/lifecycle/report-arrival.action';
import { ReportOnBlockAction } from './infra/http/action/lifecycle/report-on-block.action';
import { StartOffboardingAction } from './infra/http/action/lifecycle/start-offboarding.action';
import { FinishOffboardingAction } from './infra/http/action/lifecycle/finish-offboarding.action';
import { CloseFlightAction } from './infra/http/action/lifecycle/close-flight.action';
// diversion
import { ReportDiversionAction } from './infra/http/action/diversion/report-diversion.action';
import { GetDiversionAction } from './infra/http/action/diversion/get-diversion.action';
// emergency
import { DeclareEmergencyAction } from './infra/http/action/emergency/declare-emergency.action';
import { UpdateEmergencyAction } from './infra/http/action/emergency/update-emergency.action';
import { ResolveEmergencyAction } from './infra/http/action/emergency/resolve-emergency.action';
import { ListEmergenciesAction } from './infra/http/action/emergency/list-emergencies.action';
// events
import { ListEventsAction } from './infra/http/action/events/list-events.action';
// ofp
import { GetOfpAction } from './infra/http/action/ofp/get-ofp.action';
// path
import { GetPathAction } from './infra/http/action/path/get-path.action';
// rotation
import { AddFlightToRotationAction } from './infra/http/action/rotation/add-flight-to-rotation.action';
import { RemoveFlightFromRotationAction } from './infra/http/action/rotation/remove-flight-from-rotation.action';

import { DeclareEmergencyHandler } from './application/command/emergency/declare-emergency.command';
import { UpdateEmergencyHandler } from './application/command/emergency/update-emergency.command';
import { ResolveEmergencyHandler } from './application/command/emergency/resolve-emergency.command';
import { ListEmergenciesHandler } from './application/query/emergency/list-emergencies.query';
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
import { CreateFlightFromSimbriefHandler } from './application/command/create-flight-from-simbrief.command';
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
import { ListEventsHandler } from './application/query/events/list-events.query';
import { GetDiversionHandler } from './application/query/diversion/get-diversion.query';
import { ReportFlightDiversionHandler } from './application/command/diversion/report-flight-diversion.command';

@Module({
  imports: [PrismaModule, DiscordModule, AdsbModule, SimbriefModule],
  controllers: [
    CreateFlightAction,
    CreateFlightFromSimbriefAction,
    ListFlightsAction,
    GetFlightAction,
    RemoveFlightAction,

    UpdatePreliminaryLoadsheetAction,

    UpdateScheduledTimesheetAction,
    UpdatePredictedTimesheetAction,

    ChangeFlightVisibilityAction,

    UpdateDepartureGateAction,
    UpdateArrivalGateAction,

    UpdateDepartureRunwayAction,
    UpdateArrivalRunwayAction,

    MarkFlightAsReadyAction,
    CheckInPilotAction,
    StartBoardingAction,
    FinishBoardingAction,
    ReportOffBlockAction,
    ReportTakeoffAction,
    ReportArrivalAction,
    ReportOnBlockAction,
    StartOffboardingAction,
    FinishOffboardingAction,
    CloseFlightAction,

    ReportDiversionAction,
    GetDiversionAction,

    DeclareEmergencyAction,
    UpdateEmergencyAction,
    ResolveEmergencyAction,
    ListEmergenciesAction,

    ListEventsAction,

    GetOfpAction,

    GetPathAction,

    AddFlightToRotationAction,
    RemoveFlightFromRotationAction,
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
