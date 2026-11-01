import { SetMetadata } from '@nestjs/common';
import { SessionClient } from '../../../../modules/auth/model/session-client';

export const ALLOWED_CLIENTS_KEY = 'allowedClients';
export const AllowClient = (...clients: SessionClient[]) =>
  SetMetadata(ALLOWED_CLIENTS_KEY, clients);
