import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { GetUserDto } from '../../../users/infra/http/request/get-user.dto';
import { SignInResponse } from '../http/request/sign-in.dto';
import { JwtTokenType, JwtUser } from '../http/request/jwt-user.dto';
import { SessionRepository } from '../database/repository/session.repository';
import { SessionNoLongerValidError } from '../../model/error/auth.error';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

@Injectable()
export class SessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async open(user: GetUserDto): Promise<SignInResponse> {
    const sessionId = v4();

    const tokens = await this.issueTokens(user, sessionId);
    await this.sessionRepository.create(
      user.id,
      sessionId,
      tokens.refreshToken,
    );

    return tokens;
  }

  async renew(user: GetUserDto, sessionId: string): Promise<SignInResponse> {
    const tokens = await this.issueTokens(user, sessionId);
    const updated = await this.sessionRepository.update(
      sessionId,
      tokens.refreshToken,
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
      this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: ACCESS_TOKEN_TTL,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: REFRESH_TOKEN_TTL,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
