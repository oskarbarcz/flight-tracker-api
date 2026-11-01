import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { GetUserDto } from '../../../users/infra/http/request/get-user.dto';
import { SignInResponse } from '../http/request/sign-in.dto';
import { JwtTokenType, JwtUser } from '../http/request/jwt-user.dto';
import { SessionRepository } from '../database/repository/session.repository';
import { SessionNoLongerValidError } from '../../model/error/auth.error';
import { SessionClient } from '../../model/session-client';

const DAY_IN_SECONDS = 24 * 60 * 60;

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

const REFRESH_TOKEN_TTL_SECONDS: Record<SessionClient, number> = {
  [SessionClient.Web]: 7 * DAY_IN_SECONDS,
  [SessionClient.Transponder]: 90 * DAY_IN_SECONDS,
};

type IssuedTokens = SignInResponse & { expiresAt: Date };

@Injectable()
export class SessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async open(
    user: GetUserDto,
    client: SessionClient = SessionClient.Web,
    deviceName: string | null = null,
  ): Promise<SignInResponse> {
    const sessionId = v4();

    const { expiresAt, ...tokens } = await this.issueTokens(
      user,
      sessionId,
      client,
    );
    await this.sessionRepository.create({
      id: sessionId,
      userId: user.id,
      token: tokens.refreshToken,
      client,
      deviceName,
      expiresAt,
    });

    return tokens;
  }

  async renew(user: GetUserDto, sessionId: string): Promise<SignInResponse> {
    const session = await this.sessionRepository.findById(sessionId);

    if (session === null || session.userId !== user.id) {
      throw new SessionNoLongerValidError();
    }

    const { expiresAt, ...tokens } = await this.issueTokens(
      user,
      sessionId,
      session.client,
    );
    const updated = await this.sessionRepository.update(
      sessionId,
      tokens.refreshToken,
      expiresAt,
    );

    if (updated === 0) {
      throw new SessionNoLongerValidError();
    }

    return tokens;
  }

  async close(sessionId: string): Promise<void> {
    await this.sessionRepository.removeSession(sessionId);
  }

  async closeAllForUser(userId: string): Promise<void> {
    await this.sessionRepository.removeAllSessionsForUser(userId);
  }

  async closeAllForUserExcept(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    await this.sessionRepository.removeAllSessionsForUserExcept(
      userId,
      sessionId,
    );
  }

  private async issueTokens(
    user: GetUserDto,
    sessionId: string,
    client: SessionClient,
  ): Promise<IssuedTokens> {
    const basePayload = {
      sub: user.id,
      session: sessionId,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      client,
    };

    const accessTokenPayload: JwtUser = {
      ...basePayload,
      type: JwtTokenType.Access,
    };

    const refreshTokenPayload: JwtUser = {
      ...basePayload,
      type: JwtTokenType.Refresh,
    };

    const refreshTokenTtl = REFRESH_TOKEN_TTL_SECONDS[client];
    const expiresAt = new Date(Date.now() + refreshTokenTtl * 1000);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: refreshTokenTtl,
      }),
    ]);

    return { accessToken, refreshToken, expiresAt };
  }
}
