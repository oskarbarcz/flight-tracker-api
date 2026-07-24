import { Module } from '@nestjs/common';
import { UsersRepository } from './infra/database/repository/users.repository';
import { CreateUserAction } from './infra/http/action/create-user.action';
import { ListUsersAction } from './infra/http/action/list-users.action';
import { GetCurrentUserAction } from './infra/http/action/get-current-user.action';
import { GetUserAction } from './infra/http/action/get-user.action';
import { UpdateUserAction } from './infra/http/action/update-user.action';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { CheckUserExistsHandler } from './application/query/check-user-exists.query';
import { GetUserSimbriefIdHandler } from './application/query/get-user-simbrief-id.query';
import { AssertUserExistsHandler } from './application/assert/assert-user-exists.query';
import { CreateUserHandler } from './application/command/create-user.command';
import { UpdateUserHandler } from './application/command/update-user.command';
import { GetUserByIdHandler } from './application/query/get-user-by-id.query';
import { ListUsersHandler } from './application/query/list-users.query';
import { GetPilotHandler } from './application/query/get-pilot.query';
import { FlightLifecycleListener } from './application/event/external/flight-lifecycle.listener';
import { UserTravelRepository } from './infra/database/repository/user-travel.repository';
import { CreateUserTravelAction } from './infra/http/action/create-user-travel.action';
import { ListUserTravelAction } from './infra/http/action/list-user-travel.action';
import { CreateManualTravelHandler } from './application/command/create-manual-travel.command';
import { ListUserTravelHandler } from './application/query/list-user-travel.query';
import { UserAircraftRepository } from './infra/database/repository/user-aircraft.repository';
import { GetMyAircraftAction } from './infra/http/action/get-my-aircraft.action';
import { ListUserAircraftHandler } from './application/query/list-user-aircraft.query';
import { UserAircraftListener } from './application/event/external/user-aircraft.listener';

@Module({
  controllers: [
    CreateUserAction,
    ListUsersAction,
    GetCurrentUserAction,
    GetMyAircraftAction,
    GetUserAction,
    UpdateUserAction,
    CreateUserTravelAction,
    ListUserTravelAction,
  ],
  providers: [
    UsersRepository,
    UserTravelRepository,
    UserAircraftRepository,
    CheckUserExistsHandler,
    GetUserSimbriefIdHandler,
    AssertUserExistsHandler,
    CreateUserHandler,
    UpdateUserHandler,
    GetUserByIdHandler,
    ListUsersHandler,
    GetPilotHandler,
    CreateManualTravelHandler,
    ListUserTravelHandler,
    ListUserAircraftHandler,
    FlightLifecycleListener,
    UserAircraftListener,
  ],
  imports: [PrismaModule],
  exports: [UsersRepository],
})
export class UsersModule {}
