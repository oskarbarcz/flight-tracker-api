import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientGuard } from './client.guard';
import { ALLOWED_CLIENTS_KEY } from '../decorator/allow-client.decorator';
import { IS_PUBLIC_KEY } from '../decorator/skip-auth.decorator';
import { SessionClient } from '../../../../modules/auth/model/session-client';
import { ClientNotAllowedError } from '../../../../modules/auth/model/error/auth.error';

type Metadata = { allowedClients?: SessionClient[]; isPublic?: boolean };

function contextFor(client: SessionClient | null): ExecutionContext {
  const request = client === null ? {} : { user: { client } };

  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

function guardWith(metadata: Metadata): ClientGuard {
  const reflector = {
    getAllAndOverride: (key: string) =>
      key === ALLOWED_CLIENTS_KEY
        ? metadata.allowedClients
        : key === IS_PUBLIC_KEY
          ? metadata.isPublic
          : undefined,
  } as unknown as Reflector;

  return new ClientGuard(reflector);
}

describe('ClientGuard', () => {
  it('lets the browser through everywhere', () => {
    expect(guardWith({}).canActivate(contextFor(SessionClient.Web))).toBe(true);
  });

  it('lets a request without a token through', () => {
    expect(guardWith({}).canActivate(contextFor(null))).toBe(true);
  });

  it('lets the Transponder through where it is allowed', () => {
    const guard = guardWith({ allowedClients: [SessionClient.Transponder] });

    expect(guard.canActivate(contextFor(SessionClient.Transponder))).toBe(true);
  });

  it('lets the Transponder through on public routes', () => {
    const guard = guardWith({ isPublic: true });

    expect(guard.canActivate(contextFor(SessionClient.Transponder))).toBe(true);
  });

  it('refuses the Transponder everywhere else', () => {
    expect(() =>
      guardWith({}).canActivate(contextFor(SessionClient.Transponder)),
    ).toThrow(ClientNotAllowedError);
  });
});
