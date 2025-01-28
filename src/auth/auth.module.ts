import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import * as process from 'node:process';
import { APP_GUARD } from '@nestjs/core';
import { JwtTokenGuard } from './guard/jwt-token.guard';
import { RolesGuard } from './guard/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionRepository } from './session.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionRepository,
    { provide: APP_GUARD, useClass: JwtTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  imports: [
    UsersModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      privateKey: process.env.JWT_PRIVATE_KEY,
      publicKey: process.env.JWT_PUBLIC_KEY,
      signOptions: {
        algorithm: 'ES256',
      },
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
