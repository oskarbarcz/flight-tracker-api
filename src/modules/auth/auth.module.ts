import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignInAction } from './infra/http/action/sign-in.action';
import { RefreshTokenAction } from './infra/http/action/refresh-token.action';
import { SignOutAction } from './infra/http/action/sign-out.action';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtTokenGuard } from '../../core/http/auth/guard/jwt-token.guard';
import { RolesGuard } from '../../core/http/auth/guard/roles.guard';
import { PrismaModule } from '../../core/provider/prisma/prisma.module';
import { SessionRepository } from './infra/database/repository/session.repository';
import { GoogleModule } from '../../core/provider/google/google.module';
import { DiscordModule } from '../../core/provider/discord/discord.module';
import { GoogleSignInAction } from './infra/http/action/google-sign-in.action';
import { LinkGoogleAccountAction } from './infra/http/action/link-google-account.action';
import { UnlinkGoogleAccountAction } from './infra/http/action/unlink-google-account.action';
import { DiscordSignInAction } from './infra/http/action/discord-sign-in.action';
import { LinkDiscordAccountAction } from './infra/http/action/link-discord-account.action';
import { UnlinkDiscordAccountAction } from './infra/http/action/unlink-discord-account.action';
import { GetDiscordServerMembershipAction } from './infra/http/action/get-discord-server-membership.action';
import { SessionService } from './infra/service/session.service';
import { SignInHandler } from './application/command/sign-in.command';
import { SignInWithGoogleHandler } from './application/command/sign-in-with-google.command';
import { LinkGoogleAccountHandler } from './application/command/link-google-account.command';
import { UnlinkGoogleAccountHandler } from './application/command/unlink-google-account.command';
import { SignInWithDiscordHandler } from './application/command/sign-in-with-discord.command';
import { LinkDiscordAccountHandler } from './application/command/link-discord-account.command';
import { UnlinkDiscordAccountHandler } from './application/command/unlink-discord-account.command';
import { GetDiscordServerMembershipHandler } from './application/query/get-discord-server-membership.query';
import { RefreshTokenHandler } from './application/command/refresh-token.command';
import { SignOutHandler } from './application/command/sign-out.command';
import { SignOutEverywhereHandler } from './application/command/sign-out-everywhere.command';
import { SignOutOtherSessionsHandler } from './application/command/sign-out-other-sessions.command';
import { ClientGuard } from '../../core/http/auth/guard/client.guard';
import { DeviceAuthorizationRepository } from './infra/database/repository/device-authorization.repository';
import { StartDeviceAuthorizationAction } from './infra/http/action/start-device-authorization.action';
import { RedeemDeviceAuthorizationAction } from './infra/http/action/redeem-device-authorization.action';
import { GetDeviceAuthorizationAction } from './infra/http/action/get-device-authorization.action';
import { ApproveDeviceAuthorizationAction } from './infra/http/action/approve-device-authorization.action';
import { DenyDeviceAuthorizationAction } from './infra/http/action/deny-device-authorization.action';
import { ListSessionsAction } from './infra/http/action/list-sessions.action';
import { RevokeSessionAction } from './infra/http/action/revoke-session.action';
import { StartDeviceAuthorizationHandler } from './application/command/start-device-authorization.command';
import { RedeemDeviceAuthorizationHandler } from './application/command/redeem-device-authorization.command';
import { DecideDeviceAuthorizationHandler } from './application/command/decide-device-authorization.command';
import { GetDeviceAuthorizationHandler } from './application/query/get-device-authorization.query';
import { ListSessionsHandler } from './application/query/list-sessions.query';
import { RevokeSessionHandler } from './application/command/revoke-session.command';

@Module({
  controllers: [
    SignInAction,
    GoogleSignInAction,
    LinkGoogleAccountAction,
    UnlinkGoogleAccountAction,
    DiscordSignInAction,
    LinkDiscordAccountAction,
    UnlinkDiscordAccountAction,
    GetDiscordServerMembershipAction,
    RefreshTokenAction,
    SignOutAction,
    StartDeviceAuthorizationAction,
    RedeemDeviceAuthorizationAction,
    GetDeviceAuthorizationAction,
    ApproveDeviceAuthorizationAction,
    DenyDeviceAuthorizationAction,
    ListSessionsAction,
    RevokeSessionAction,
  ],
  providers: [
    SessionRepository,
    DeviceAuthorizationRepository,
    SessionService,
    SignInHandler,
    SignInWithGoogleHandler,
    LinkGoogleAccountHandler,
    UnlinkGoogleAccountHandler,
    SignInWithDiscordHandler,
    LinkDiscordAccountHandler,
    UnlinkDiscordAccountHandler,
    GetDiscordServerMembershipHandler,
    RefreshTokenHandler,
    SignOutHandler,
    SignOutEverywhereHandler,
    SignOutOtherSessionsHandler,
    StartDeviceAuthorizationHandler,
    RedeemDeviceAuthorizationHandler,
    DecideDeviceAuthorizationHandler,
    GetDeviceAuthorizationHandler,
    ListSessionsHandler,
    RevokeSessionHandler,
    { provide: APP_GUARD, useClass: JwtTokenGuard },
    { provide: APP_GUARD, useClass: ClientGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  imports: [
    UsersModule,
    PrismaModule,
    GoogleModule,
    DiscordModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        privateKey: config.getOrThrow<string>('JWT_PRIVATE_KEY'),
        publicKey: config.getOrThrow<string>('JWT_PUBLIC_KEY'),
        signOptions: {
          algorithm: 'ES256',
        },
      }),
    }),
  ],
})
export class AuthModule {}
