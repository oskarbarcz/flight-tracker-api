import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './service/auth.service';
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

@Module({
  controllers: [SignInAction, RefreshTokenAction, SignOutAction],
  providers: [
    AuthService,
    SessionRepository,
    { provide: APP_GUARD, useClass: JwtTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  imports: [
    UsersModule,
    PrismaModule,
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
  exports: [AuthService],
})
export class AuthModule {}
