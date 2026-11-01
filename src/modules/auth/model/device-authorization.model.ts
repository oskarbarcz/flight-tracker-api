import { ApiProperty } from '@nestjs/swagger';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { SessionClient } from './session-client';

export enum DeviceAuthorizationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Denied = 'denied',
}

export const DEVICE_AUTHORIZATION_LIFETIME_SECONDS = 10 * 60;

export const DEVICE_AUTHORIZATION_POLL_INTERVAL_SECONDS = 5;

export const DEVICE_ACTIVATION_PATH = '/activate';

const USER_CODE_ALPHABET = 'BCDFGHJKLMNPQRSTVWXZ';

const USER_CODE_LENGTH = 8;

export type DeviceAuthorizationRecord = {
  id: string;
  userCode: string;
  client: SessionClient;
  deviceName: string | null;
  status: DeviceAuthorizationStatus;
  userId: string | null;
  createdAt: Date;
  expiresAt: Date;
};

export function generateDeviceCode(): string {
  return randomBytes(32).toString('base64url');
}

export function hashDeviceCode(deviceCode: string): string {
  return createHash('sha256').update(deviceCode).digest('hex');
}

export function generateUserCode(): string {
  return Array.from(
    { length: USER_CODE_LENGTH },
    () => USER_CODE_ALPHABET[randomInt(USER_CODE_ALPHABET.length)],
  ).join('');
}

export function normalizeUserCode(userCode: string): string {
  return userCode.toUpperCase().replace(/[\s-]/g, '');
}

export function formatUserCode(userCode: string): string {
  const half = USER_CODE_LENGTH / 2;

  return `${userCode.slice(0, half)}-${userCode.slice(half)}`;
}

export class DeviceAuthorizationStart {
  @ApiProperty({
    description:
      'Secret the device polls `POST /api/v1/auth/device/token` with. Never show it to the user.',
    example: 'q0Hn8v1o3qGqWm7dJ9mP0xXcQe2yS5bWkT1uVfZrL4A',
  })
  deviceCode!: string;

  @ApiProperty({
    description: 'Code the user confirms in the browser',
    example: 'BCDF-GHJK',
  })
  userCode!: string;

  @ApiProperty({
    description: 'Page where the user enters the code',
    example: 'https://mypreflight.io/activate',
  })
  verificationUri!: string;

  @ApiProperty({
    description: 'The same page with the code already filled in',
    example: 'https://mypreflight.io/activate?code=BCDF-GHJK',
  })
  verificationUriComplete!: string;

  @ApiProperty({
    description: 'Seconds until the codes expire',
    example: DEVICE_AUTHORIZATION_LIFETIME_SECONDS,
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'Seconds to wait between polls',
    example: DEVICE_AUTHORIZATION_POLL_INTERVAL_SECONDS,
  })
  interval!: number;
}

export class DeviceAuthorizationDetails {
  @ApiProperty({
    description: 'Code the device shows, for the user to compare',
    example: 'BCDF-GHJK',
  })
  userCode!: string;

  @ApiProperty({
    description: 'What is asking to sign in',
    enum: SessionClient,
    example: SessionClient.Transponder,
  })
  client!: SessionClient;

  @ApiProperty({
    description: 'Name the device gave its machine. `null` when it sent none.',
    example: 'SIM-PC',
    nullable: true,
    type: 'string',
  })
  deviceName!: string | null;

  @ApiProperty({
    description: 'Time the device asked to sign in',
    example: '2026-11-01T12:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Time the code expires',
    example: '2026-11-01T12:10:00.000Z',
  })
  expiresAt!: Date;
}

export class DeviceAuthorizationPending {
  @ApiProperty({
    description: 'The user has not decided yet',
    enum: [DeviceAuthorizationStatus.Pending],
    example: DeviceAuthorizationStatus.Pending,
  })
  status!: DeviceAuthorizationStatus.Pending;
}
