import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { SessionClient } from '../../../model/session-client';
import {
  DeviceAuthorizationRecord,
  DeviceAuthorizationStatus,
} from '../../../model/device-authorization.model';

export type NewDeviceAuthorization = {
  deviceCodeHash: string;
  userCode: string;
  client: SessionClient;
  deviceName: string | null;
  expiresAt: Date;
};

const DEVICE_AUTHORIZATION_FIELDS = {
  id: true,
  userCode: true,
  client: true,
  deviceName: true,
  status: true,
  userId: true,
  createdAt: true,
  expiresAt: true,
} as const;

@Injectable()
export class DeviceAuthorizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorization: NewDeviceAuthorization): Promise<void> {
    await this.prisma.deviceAuthorization.create({
      data: {
        deviceCode: authorization.deviceCodeHash,
        userCode: authorization.userCode,
        client: authorization.client,
        deviceName: authorization.deviceName,
        createdAt: new Date(),
        expiresAt: authorization.expiresAt,
      },
    });
  }

  async findPendingByUserCode(
    userCode: string,
  ): Promise<DeviceAuthorizationRecord | null> {
    const authorization = await this.prisma.deviceAuthorization.findFirst({
      where: {
        userCode,
        status: DeviceAuthorizationStatus.Pending,
        expiresAt: { gt: new Date() },
      },
      select: DEVICE_AUTHORIZATION_FIELDS,
    });

    return authorization as DeviceAuthorizationRecord | null;
  }

  async findLiveByDeviceCodeHash(
    deviceCodeHash: string,
  ): Promise<DeviceAuthorizationRecord | null> {
    const authorization = await this.prisma.deviceAuthorization.findFirst({
      where: { deviceCode: deviceCodeHash, expiresAt: { gt: new Date() } },
      select: DEVICE_AUTHORIZATION_FIELDS,
    });

    return authorization as DeviceAuthorizationRecord | null;
  }

  async decidePending(
    userCode: string,
    status:
      | DeviceAuthorizationStatus.Approved
      | DeviceAuthorizationStatus.Denied,
    userId: string,
  ): Promise<number> {
    const { count } = await this.prisma.deviceAuthorization.updateMany({
      where: {
        userCode,
        status: DeviceAuthorizationStatus.Pending,
        expiresAt: { gt: new Date() },
      },
      data: { status, userId },
    });

    return count;
  }

  async removeWithStatus(
    id: string,
    status: DeviceAuthorizationStatus,
  ): Promise<number> {
    const { count } = await this.prisma.deviceAuthorization.deleteMany({
      where: { id, status },
    });

    return count;
  }

  async removeExpired(): Promise<void> {
    await this.prisma.deviceAuthorization.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
  }
}
