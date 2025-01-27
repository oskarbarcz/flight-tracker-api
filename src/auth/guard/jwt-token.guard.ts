import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorator/skip-auth.decorator';
import { JwtTokenType, JwtUser } from '../dto/jwt-user.dto';
import { CannotUseTokenTypeError } from '../dto/error.dto';

@Injectable()
export class JwtTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      const payload = await this.jwtService.verifyAsync<JwtUser>(token, {
        publicKey: process.env.JWT_PUBLIC_KEY,
      });

      const isRefreshEndpoint = request.url === '/api/v1/auth/refresh';

      if (!this.isCorrectType(payload.type, isRefreshEndpoint)) {
        throw new CannotUseTokenTypeError(payload.type);
      }

      request['user'] = payload;
    } catch (e: any) {
      if (e instanceof CannotUseTokenTypeError) {
        throw e;
      }

      throw new UnauthorizedException();
    }
    return true;
  }

  private isCorrectType(
    type: JwtTokenType,
    isRefreshEndpoint: boolean,
  ): boolean {
    return isRefreshEndpoint
      ? type === JwtTokenType.Refresh
      : type === JwtTokenType.Access;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
