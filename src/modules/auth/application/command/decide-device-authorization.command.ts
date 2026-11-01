import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthorizationRepository } from '../../infra/database/repository/device-authorization.repository';
import {
  DeviceAuthorizationStatus,
  normalizeUserCode,
} from '../../model/device-authorization.model';
import { DeviceAuthorizationNotFoundError } from '../../model/error/auth.error';

export class DecideDeviceAuthorizationCommand {
  constructor(
    public readonly userCode: string,
    public readonly decision:
      | DeviceAuthorizationStatus.Approved
      | DeviceAuthorizationStatus.Denied,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DecideDeviceAuthorizationCommand)
export class DecideDeviceAuthorizationHandler implements ICommandHandler<DecideDeviceAuthorizationCommand> {
  constructor(
    private readonly deviceAuthorizations: DeviceAuthorizationRepository,
  ) {}

  async execute(command: DecideDeviceAuthorizationCommand): Promise<void> {
    const decided = await this.deviceAuthorizations.decidePending(
      normalizeUserCode(command.userCode),
      command.decision,
      command.userId,
    );

    if (decided === 0) {
      throw new DeviceAuthorizationNotFoundError();
    }
  }
}
