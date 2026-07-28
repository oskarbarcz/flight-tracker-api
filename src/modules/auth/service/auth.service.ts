import { Injectable } from '@nestjs/common';
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from '../infra/http/request/error.dto';
import { UsersRepository } from '../../users/infra/database/repository/users.repository';
import { JwtService } from '@nestjs/jwt';
import { GetUserDto } from '../../users/infra/http/request/get-user.dto';
import { SignInResponse } from '../infra/http/request/sign-in.dto';
import { SessionRepository } from '../infra/database/repository/session.repository';
import { v4 } from 'uuid';
import { JwtTokenType, JwtUser } from '../infra/http/request/jwt-user.dto';
import { GoogleIdentityClient } from '../../../core/provider/google/client/google-identity.client';
import { GoogleAccountNotLinkedError } from '../model/error/google-auth.error';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly sessionRepository: SessionRepository,
    private readonly googleIdentityClient: GoogleIdentityClient,
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByCredentials(email, password);

    if (user === null) {
      throw new InvalidCredentialsError();
    }

    return this.openSession(user);
  }

  async signInWithGoogle(idToken: string): Promise<SignInResponse> {
    const identity = await this.googleIdentityClient.verifyIdToken(idToken);
    const user = await this.usersService.findByGoogleId(identity.googleId);

    if (user === null) {
      throw new GoogleAccountNotLinkedError();
    }

    return this.openSession(user);
  }

  async linkGoogleAccount(userId: string, idToken: string): Promise<void> {
    const identity = await this.googleIdentityClient.verifyIdToken(idToken);

    await this.usersService.linkGoogleAccount(userId, identity.googleId);
  }

  private async openSession(user: GetUserDto): Promise<SignInResponse> {
    const sessionId = v4();

    const { accessToken, refreshToken } = await this.getTokens(user, sessionId);
    await this.sessionRepository.create(user.id, sessionId, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken(userId: string, sessionId: string): Promise<any> {
    const user = await this.usersService.findById(userId);

    if (user === null) {
      throw new InvalidRefreshTokenError();
    }

    const { accessToken, refreshToken } = await this.getTokens(user, sessionId);
    await this.sessionRepository.update(sessionId, refreshToken);

    return { accessToken, refreshToken };
  }

  async signOutFromSession(sessionId: string): Promise<void> {
    await this.sessionRepository.removeSession(sessionId);
  }

  async signOutFromAnywhere(userId: string) {
    await this.sessionRepository.removeAllSessionsForUser(userId);
  }

  private async getTokens(
    user: GetUserDto,
    sessionId: string,
  ): Promise<SignInResponse> {
    const basePayload = {
      sub: user.id,
      session: sessionId,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
    };

    const accessTokenPayload: JwtUser = {
      ...basePayload,
      type: JwtTokenType.Access,
    };

    const refreshTokenPayload: JwtUser = {
      ...basePayload,
      type: JwtTokenType.Refresh,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, { expiresIn: '15m' }),
      this.jwtService.signAsync(refreshTokenPayload, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }
}
