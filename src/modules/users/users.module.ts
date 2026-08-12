import { Module } from '@nestjs/common';
import { UsersRepository } from './infra/database/repository/users.repository';
import { CreateUserAction } from './infra/http/action/create-user.action';
import { ListUsersAction } from './infra/http/action/list-users.action';
import { GetCurrentUserAction } from './infra/http/action/get-current-user.action';
import { GetUserAction } from './infra/http/action/get-user.action';
import { UpdateOwnProfileAction } from './infra/http/action/update-own-profile.action';
import { UpdateUserAction } from './infra/http/action/update-user.action';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { CheckUserExistsHandler } from './application/query/check-user-exists.query';
import { GetUserSimbriefIdHandler } from './application/query/get-user-simbrief-id.query';
import { GetUserDiscordIdHandler } from './application/query/get-user-discord-id.query';
import { GetUserWeatherSourceHandler } from './application/query/get-user-weather-source.query';
import { AssertUserExistsHandler } from './application/assert/assert-user-exists.query';
import { CreateUserHandler } from './application/command/create-user.command';
import { UpdateOwnProfileHandler } from './application/command/update-own-profile.command';
import { UpdateUserHandler } from './application/command/update-user.command';
import { GetOwnUserHandler } from './application/query/get-own-user.query';
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
import { UserEmailCacheListener } from './application/event/internal/user-email-cache.listener';
import { UserTokenRepository } from './infra/database/repository/user-token.repository';
import { RequestEmailChangeAction } from './infra/http/action/request-email-change.action';
import { ConfirmEmailChangeAction } from './infra/http/action/confirm-email-change.action';
import { RequestEmailChangeHandler } from './application/command/request-email-change.command';
import { ConfirmEmailChangeHandler } from './application/command/confirm-email-change.command';
import { EmailChangeMailListener } from './application/event/internal/email-change-mail.listener';
import { MailgunModule } from '../../core/provider/mailgun/mailgun.module';
import { ChangePasswordAction } from './infra/http/action/change-password.action';
import { SetPasswordAction } from './infra/http/action/set-password.action';
import { ChangePasswordHandler } from './application/command/change-password.command';
import { SetPasswordHandler } from './application/command/set-password.command';
import { RequestPasswordResetAction } from './infra/http/action/request-password-reset.action';
import { ConfirmPasswordResetAction } from './infra/http/action/confirm-password-reset.action';
import { RequestPasswordResetHandler } from './application/command/request-password-reset.command';
import { ConfirmPasswordResetHandler } from './application/command/confirm-password-reset.command';
import { PasswordResetMailListener } from './application/event/internal/password-reset-mail.listener';

@Module({
  controllers: [
    CreateUserAction,
    ListUsersAction,
    GetCurrentUserAction,
    GetMyAircraftAction,
    GetUserAction,
    UpdateOwnProfileAction,
    UpdateUserAction,
    CreateUserTravelAction,
    ListUserTravelAction,
    RequestEmailChangeAction,
    ConfirmEmailChangeAction,
    ChangePasswordAction,
    SetPasswordAction,
    RequestPasswordResetAction,
    ConfirmPasswordResetAction,
  ],
  providers: [
    UsersRepository,
    UserTokenRepository,
    UserTravelRepository,
    UserAircraftRepository,
    CheckUserExistsHandler,
    GetUserSimbriefIdHandler,
    GetUserDiscordIdHandler,
    GetUserWeatherSourceHandler,
    AssertUserExistsHandler,
    CreateUserHandler,
    UpdateOwnProfileHandler,
    UpdateUserHandler,
    GetOwnUserHandler,
    GetUserByIdHandler,
    ListUsersHandler,
    GetPilotHandler,
    CreateManualTravelHandler,
    ListUserTravelHandler,
    ListUserAircraftHandler,
    FlightLifecycleListener,
    UserAircraftListener,
    UserEmailCacheListener,
    RequestEmailChangeHandler,
    ConfirmEmailChangeHandler,
    EmailChangeMailListener,
    ChangePasswordHandler,
    SetPasswordHandler,
    RequestPasswordResetHandler,
    ConfirmPasswordResetHandler,
    PasswordResetMailListener,
  ],
  imports: [PrismaModule, MailgunModule],
  exports: [UsersRepository, UserTokenRepository],
})
export class UsersModule {}
