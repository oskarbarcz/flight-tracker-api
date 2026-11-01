import { ApiProperty } from '@nestjs/swagger';
import { SessionClient } from './session-client';

export type SessionRecord = {
  id: string;
  userId: string;
  client: SessionClient;
  deviceName: string | null;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
};

export class Session {
  @ApiProperty({
    description: 'Session unique identifier',
    example: '64a5ef90-399a-4ce5-8ee3-41c6707d0e68',
  })
  id!: string;

  @ApiProperty({
    description: 'What the session was opened from',
    enum: SessionClient,
    example: SessionClient.Transponder,
  })
  client!: SessionClient;

  @ApiProperty({
    description:
      'Name the Transponder gave its machine when it signed in. `null` for browser sessions.',
    example: 'SIM-PC',
    nullable: true,
    type: 'string',
  })
  deviceName!: string | null;

  @ApiProperty({
    description: 'Time the session was opened',
    example: '2026-11-01T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Time the session last renewed its tokens',
    example: '2026-11-01T12:00:00.000Z',
  })
  lastUsedAt!: Date;

  @ApiProperty({
    description: 'Time the session ends unless it is renewed before',
    example: '2026-11-08T12:00:00.000Z',
  })
  expiresAt!: Date;

  @ApiProperty({
    description: 'Whether this is the session the request was made with',
    example: false,
  })
  current!: boolean;
}
