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
import { GoogleSignInAction } from './infra/http/action/google-sign-in.action';
import { LinkGoogleAccountAction } from './infra/http/action/link-google-account.action';
import { UnlinkGoogleAccountAction } from './infra/http/action/unlink-google-account.action';
import { SessionService } from './infra/service/session.service';
import { SignInHandler } from './application/command/sign-in.command';
import { SignInWithGoogleHandler } from './application/command/sign-in-with-google.command';
import { LinkGoogleAccountHandler } from './application/command/link-google-account.command';
import { UnlinkGoogleAccountHandler } from './application/command/unlink-google-account.command';
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
