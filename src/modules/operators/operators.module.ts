import { Module } from '@nestjs/common';
import { CreateOperatorAction } from './infra/http/action/operator/create-operator.action';
import { ListOperatorsAction } from './infra/http/action/operator/list-operators.action';
import { GetOperatorAction } from './infra/http/action/operator/get-operator.action';
import { UpdateOperatorAction } from './infra/http/action/operator/update-operator.action';
import { DeleteOperatorAction } from './infra/http/action/operator/delete-operator.action';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { AirframesModule } from '../airframes/airframes.module';
import { OperatorsRepository } from './infra/database/repository/operators.repository';
import { CreateOperatorHandler } from './application/command/create-operator.command';
import { UpdateOperatorHandler } from './application/command/update-operator.command';
import { RemoveOperatorHandler } from './application/command/remove-operator.command';
import { GetOperatorByIdHandler } from './application/query/get-operator-by-id.query';
import { ListAllOperatorsHandler } from './application/query/list-all-operators.query';
import { CheckOperatorExistsHandler } from './application/query/check-operator-exists.query';
import { GetOperatorByIcaoCodeHandler } from './application/query/get-operator-by-icao-code.query';
import { CreateAircraftAction } from './infra/http/action/aircraft/create-aircraft.action';
import { ListAircraftAction } from './infra/http/action/aircraft/list-aircraft.action';
import { GetAircraftAction } from './infra/http/action/aircraft/get-aircraft.action';
import { UpdateAircraftAction } from './infra/http/action/aircraft/update-aircraft.action';
import { DeleteAircraftAction } from './infra/http/action/aircraft/delete-aircraft.action';
import { GetAircraftFlightHistoryAction } from './infra/http/action/get-aircraft-flight-history.action';
import { CreateAircraftHandler } from './application/command/aircraft/create-aircraft.command';
import { AircraftRepository } from './infra/database/repository/aircraft.repository';
import { GetAircraftByIdHandler } from './application/query/aircraft/get-aircraft-by-id.query';
import { ListAllAircraftHandler } from './application/query/aircraft/list-all-aircraft.query';
import { GetAircraftByRegistrationHandler } from './application/query/aircraft/get-aircraft-by-registration.query';
import { CheckAircraftExistsHandler } from './application/query/aircraft/check-aircraft-exists.query';
import { RemoveAircraftHandler } from './application/command/aircraft/remove-aircraft.command';
import { UpdateAircraftHandler } from './application/command/aircraft/update-aircraft.command';
import { AircraftLifecycleListener } from './application/event/internal/aircraft-lifecycle.listener';
import { OperatorCacheListener } from './application/event/internal/operator-cache.listener';
import { FlightLifecycleListener } from './application/event/external/flight-lifecycle.listener';
import { RepositionRepository } from './infra/database/repository/reposition.repository';
import { CreateManualRepositionHandler } from './application/command/reposition/create-manual-reposition.command';
import { ListAircraftRepositionHandler } from './application/query/reposition/list-aircraft-reposition.query';
import { CreateAircraftRepositionAction } from './infra/http/action/create-aircraft-reposition.action';
import { ListAircraftRepositionAction } from './infra/http/action/list-aircraft-reposition.action';
import { RepositionFlightLifecycleListener } from './application/event/external/reposition-flight-lifecycle.listener';
import { ListOperatorCrewAction } from './infra/http/action/list-operator-crew.action';
import { CrewRepository } from './infra/database/repository/crew.repository';
import { AssignCrewToFlightHandler } from './application/command/crew/assign-crew-to-flight.command';
import { AssignCrewMemberToFlightHandler } from './application/command/crew/assign-crew-member-to-flight.command';
import { UnassignCrewMemberFromFlightHandler } from './application/command/crew/unassign-crew-member-from-flight.command';
import { ListOperatorCrewQueryHandler } from './application/query/crew/list-operator-crew.query';
import { ListFlightCrewQueryHandler } from './application/query/crew/list-flight-crew.query';

@Module({
  imports: [PrismaModule, AirframesModule],
  controllers: [
    CreateOperatorAction,
    ListOperatorsAction,
    GetOperatorAction,
    UpdateOperatorAction,
    DeleteOperatorAction,
    CreateAircraftAction,
    ListAircraftAction,
    GetAircraftAction,
    UpdateAircraftAction,
    DeleteAircraftAction,
    GetAircraftFlightHistoryAction,
    CreateAircraftRepositionAction,
    ListAircraftRepositionAction,
    ListOperatorCrewAction,
  ],
  providers: [
    OperatorsRepository,
    AircraftRepository,
    CreateOperatorHandler,
    UpdateOperatorHandler,
    RemoveOperatorHandler,
    GetOperatorByIdHandler,
    GetOperatorByIcaoCodeHandler,
    ListAllOperatorsHandler,
    CheckOperatorExistsHandler,
    CreateAircraftHandler,
    ListAllAircraftHandler,
    GetAircraftByIdHandler,
    RemoveAircraftHandler,
    UpdateAircraftHandler,
    GetAircraftByRegistrationHandler,
    CheckAircraftExistsHandler,
    AircraftLifecycleListener,
    OperatorCacheListener,
    FlightLifecycleListener,
    RepositionRepository,
    CreateManualRepositionHandler,
    ListAircraftRepositionHandler,
    RepositionFlightLifecycleListener,
    CrewRepository,
    AssignCrewToFlightHandler,
    AssignCrewMemberToFlightHandler,
    UnassignCrewMemberFromFlightHandler,
    ListOperatorCrewQueryHandler,
    ListFlightCrewQueryHandler,
  ],
})
export class OperatorsModule {}
