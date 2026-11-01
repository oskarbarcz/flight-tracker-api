import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthorizationRepository } from '../../infra/database/repository/device-authorization.repository';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { SessionService } from '../../infra/service/session.service';
import { SignInResponse } from '../../infra/http/request/sign-in.dto';
import {
  DeviceAuthorizationStatus,
  hashDeviceCode,
} from '../../model/device-authorization.model';
import {
  DeviceAuthorizationDeniedError,
  DeviceAuthorizationNotFoundError,
} from '../../model/error/auth.error';

export class RedeemDeviceAuthorizationCommand {
  constructor(public readonly deviceCode: string) {}
}

export type DeviceTokenResult =
  | { status: DeviceAuthorizationStatus.Pending }
  | { status: DeviceAuthorizationStatus.Approved; tokens: SignInResponse };

@CommandHandler(RedeemDeviceAuthorizationCommand)
export class RedeemDeviceAuthorizationHandler implements ICommandHandler<RedeemDeviceAuthorizationCommand> {
  constructor(
    private readonly deviceAuthorizations: DeviceAuthorizationRepository,
    private readonly users: UsersRepository,
    private readonly sessionService: SessionService,
  ) {}

  async execute(
    command: RedeemDeviceAuthorizationCommand,
  ): Promise<DeviceTokenResult> {
    const authorization =
      await this.deviceAuthorizations.findLiveByDeviceCodeHash(
        hashDeviceCode(command.deviceCode),
      );

    if (authorization === null) {
      throw new DeviceAuthorizationNotFoundError();
    }

    if (authorization.status === DeviceAuthorizationStatus.Pending) {
      return { status: DeviceAuthorizationStatus.Pending };
    }

    const removed = await this.deviceAuthorizations.removeWithStatus(
      authorization.id,
      authorization.status,
    );

    if (removed === 0) {
      throw new DeviceAuthorizationNotFoundError();
    }

    if (authorization.status === DeviceAuthorizationStatus.Denied) {
      throw new DeviceAuthorizationDeniedError();
    }

    if (authorization.userId === null) {
      throw new DeviceAuthorizationNotFoundError();
    }

    const user = await this.users.findById(authorization.userId);
    const tokens = await this.sessionService.open(
      user,
      authorization.client,
      authorization.deviceName,
    );

    return { status: DeviceAuthorizationStatus.Approved, tokens };
  }
}
