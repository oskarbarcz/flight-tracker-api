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
  ],
  providers: [
    SessionRepository,
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
    { provide: APP_GUARD, useClass: JwtTokenGuard },
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
