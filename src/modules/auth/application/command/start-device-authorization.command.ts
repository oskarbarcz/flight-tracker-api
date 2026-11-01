import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { DeviceAuthorizationRepository } from '../../infra/database/repository/device-authorization.repository';
import {
  DEVICE_ACTIVATION_PATH,
  DEVICE_AUTHORIZATION_LIFETIME_SECONDS,
  DEVICE_AUTHORIZATION_POLL_INTERVAL_SECONDS,
  DeviceAuthorizationStart,
  formatUserCode,
  generateDeviceCode,
  generateUserCode,
  hashDeviceCode,
} from '../../model/device-authorization.model';
import { SessionClient } from '../../model/session-client';

export class StartDeviceAuthorizationCommand {
  constructor(
    public readonly client: SessionClient,
    public readonly deviceName: string | null,
  ) {}
}

@CommandHandler(StartDeviceAuthorizationCommand)
export class StartDeviceAuthorizationHandler implements ICommandHandler<StartDeviceAuthorizationCommand> {
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly deviceAuthorizations: DeviceAuthorizationRepository,
    config: ConfigService,
  ) {
    this.frontendBaseUrl = config.getOrThrow<string>('FRONTEND_BASE_URL');
  }

  async execute(
    command: StartDeviceAuthorizationCommand,
  ): Promise<DeviceAuthorizationStart> {
    await this.deviceAuthorizations.removeExpired();

    const deviceCode = generateDeviceCode();
    const userCode = generateUserCode();

    await this.deviceAuthorizations.create({
      deviceCodeHash: hashDeviceCode(deviceCode),
      userCode,
      client: command.client,
      deviceName: command.deviceName,
      expiresAt: new Date(
        Date.now() + DEVICE_AUTHORIZATION_LIFETIME_SECONDS * 1000,
      ),
    });

    const displayedUserCode = formatUserCode(userCode);
    const verificationUri = `${this.frontendBaseUrl}${DEVICE_ACTIVATION_PATH}`;

    return {
      deviceCode,
      userCode: displayedUserCode,
      verificationUri,
      verificationUriComplete: `${verificationUri}?code=${displayedUserCode}`,
      expiresIn: DEVICE_AUTHORIZATION_LIFETIME_SECONDS,
      interval: DEVICE_AUTHORIZATION_POLL_INTERVAL_SECONDS,
    };
  }
}
