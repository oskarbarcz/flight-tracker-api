import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOWED_CLIENTS_KEY } from '../decorator/allow-client.decorator';
import { IS_PUBLIC_KEY } from '../decorator/skip-auth.decorator';
import { SessionClient } from '../../../../modules/auth/model/session-client';
import { JwtUser } from '../../../../modules/auth/infra/http/request/jwt-user.dto';
import { ClientNotAllowedError } from '../../../../modules/auth/model/error/auth.error';

@Injectable()
export class ClientGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<{ user?: JwtUser }>().user;

    if (user === undefined || user.client === SessionClient.Web) {
      return true;
    }

    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      targets,
    );
    const allowedClients =
      this.reflector.getAllAndOverride<SessionClient[]>(
        ALLOWED_CLIENTS_KEY,
        targets,
      ) ?? [];

    if (isPublic || allowedClients.includes(user.client)) {
      return true;
    }

    throw new ClientNotAllowedError(user.client);
  }
}
