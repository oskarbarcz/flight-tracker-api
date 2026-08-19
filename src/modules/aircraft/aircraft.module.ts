import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { AircraftRepository } from './infra/database/repository/aircraft.repository';
import { RepositionRepository } from './infra/database/repository/reposition.repository';
import { CreateAircraftAction } from './infra/http/action/create-aircraft.action';
import { ListAircraftAction } from './infra/http/action/list-aircraft.action';
import { GetAircraftAction } from './infra/http/action/get-aircraft.action';
import { UpdateAircraftAction } from './infra/http/action/update-aircraft.action';
import { DeleteAircraftAction } from './infra/http/action/delete-aircraft.action';
import { GetAircraftFlightHistoryAction } from './infra/http/action/get-aircraft-flight-history.action';
import { CreateAircraftRepositionAction } from './infra/http/action/reposition/create-aircraft-reposition.action';
import { ListAircraftRepositionAction } from './infra/http/action/reposition/list-aircraft-reposition.action';
import { AssignCabinLayoutAction } from './infra/http/action/cabin-layout/assign-cabin-layout.action';
import { RemoveCabinLayoutAction } from './infra/http/action/cabin-layout/remove-cabin-layout.action';
import { SuggestCabinLayoutsAction } from './infra/http/action/cabin-layout/suggest-cabin-layouts.action';
import { CreateAircraftHandler } from './application/command/create-aircraft.command';
import { UpdateAircraftHandler } from './application/command/update-aircraft.command';
import { RemoveAircraftHandler } from './application/command/remove-aircraft.command';
import { CreateManualRepositionHandler } from './application/command/reposition/create-manual-reposition.command';
import { AssignCabinLayoutHandler } from './application/command/assign-cabin-layout.command';
import { RemoveCabinLayoutHandler } from './application/command/remove-cabin-layout.command';
import { GetAircraftByIdHandler } from './application/query/get-aircraft-by-id.query';
import { GetAircraftByRegistrationHandler } from './application/query/get-aircraft-by-registration.query';
import { ListAllAircraftHandler } from './application/query/list-all-aircraft.query';
import { CheckAircraftExistsHandler } from './application/query/check-aircraft-exists.query';
import { GetOperatorFleetSummaryHandler } from './application/query/get-operator-fleet-summary.query';
import { ListAircraftRepositionHandler } from './application/query/reposition/list-aircraft-reposition.query';
import { SuggestAircraftCabinLayoutsHandler } from './application/query/suggest-aircraft-cabin-layouts.query';
import { FlightLifecycleListener } from './application/event/external/flight-lifecycle.listener';
import { RepositionFlightLifecycleListener } from './application/event/external/reposition-flight-lifecycle.listener';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateAircraftAction,
    ListAircraftAction,
    GetAircraftAction,
    UpdateAircraftAction,
    DeleteAircraftAction,
    GetAircraftFlightHistoryAction,
    CreateAircraftRepositionAction,
    ListAircraftRepositionAction,
    AssignCabinLayoutAction,
    RemoveCabinLayoutAction,
    SuggestCabinLayoutsAction,
  ],
  providers: [
    AircraftRepository,
    RepositionRepository,
    CreateAircraftHandler,
    UpdateAircraftHandler,
    RemoveAircraftHandler,
    CreateManualRepositionHandler,
    AssignCabinLayoutHandler,
    RemoveCabinLayoutHandler,
    GetAircraftByIdHandler,
    GetAircraftByRegistrationHandler,
    ListAllAircraftHandler,
    CheckAircraftExistsHandler,
    GetOperatorFleetSummaryHandler,
    ListAircraftRepositionHandler,
    SuggestAircraftCabinLayoutsHandler,
    FlightLifecycleListener,
    RepositionFlightLifecycleListener,
  ],
})
export class AircraftModule {}
