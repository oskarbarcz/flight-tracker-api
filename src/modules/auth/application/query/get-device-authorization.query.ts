import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceAuthorizationRepository } from '../../infra/database/repository/device-authorization.repository';
import {
  DeviceAuthorizationDetails,
  formatUserCode,
  normalizeUserCode,
} from '../../model/device-authorization.model';
import { DeviceAuthorizationNotFoundError } from '../../model/error/auth.error';

export class GetDeviceAuthorizationQuery {
  constructor(public readonly userCode: string) {}
}

@QueryHandler(GetDeviceAuthorizationQuery)
export class GetDeviceAuthorizationHandler implements IQueryHandler<GetDeviceAuthorizationQuery> {
  constructor(
    private readonly deviceAuthorizations: DeviceAuthorizationRepository,
  ) {}

  async execute(
    query: GetDeviceAuthorizationQuery,
  ): Promise<DeviceAuthorizationDetails> {
    const authorization = await this.deviceAuthorizations.findPendingByUserCode(
      normalizeUserCode(query.userCode),
    );

    if (authorization === null) {
      throw new DeviceAuthorizationNotFoundError();
    }

    return {
      userCode: formatUserCode(authorization.userCode),
      client: authorization.client,
      deviceName: authorization.deviceName,
      createdAt: authorization.createdAt,
      expiresAt: authorization.expiresAt,
    };
  }
}
