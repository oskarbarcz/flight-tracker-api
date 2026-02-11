import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { GetUserDto } from '../../users/dto/get-user.dto';
import { SignInResponse } from '../dto/sign-in.dto';
import { SessionRepository } from '../repository/session.repository';
import { v4 } from 'uuid';
import { JwtTokenType, JwtUser } from '../dto/jwt-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByCredentials(email, password);

    if (user === null) {
      throw new UnauthorizedException('Credentials are incorrect.');
    }

    const sessionId = v4();

    const { accessToken, refreshToken } = await this.getTokens(user, sessionId);
    await this.sessionRepository.new(user.id, sessionId, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken(userId: string, sessionId: string): Promise<any> {
    const user = await this.usersService.findOne(userId);

    if (user === null) {
      throw new UnauthorizedException('Refresh token is not valid.');
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
