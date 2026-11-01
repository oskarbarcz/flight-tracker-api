import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { SessionClient } from '../../../model/session-client';
import { SessionRecord } from '../../../model/session.model';

export type NewSession = {
  id: string;
  userId: string;
  token: string;
  client: SessionClient;
  deviceName: string | null;
  expiresAt: Date;
};

const SESSION_FIELDS = {
  id: true,
  userId: true,
  client: true,
  deviceName: true,
  createdAt: true,
  lastUsedAt: true,
  expiresAt: true,
} as const;

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: NewSession): Promise<void> {
    const now = new Date();

    await this.prisma.jwtRefreshToken.create({
      data: {
        id: session.id,
        token: await this.hash(session.token),
        userId: session.userId,
        client: session.client,
        deviceName: session.deviceName,
        createdAt: now,
        lastUsedAt: now,
        expiresAt: session.expiresAt,
      },
    });
  }

  async findById(id: string): Promise<SessionRecord | null> {
    const session = await this.prisma.jwtRefreshToken.findUnique({
      where: { id },
      select: SESSION_FIELDS,
    });

    return session as SessionRecord | null;
  }

  async findActiveForUser(userId: string): Promise<SessionRecord[]> {
    const sessions = await this.prisma.jwtRefreshToken.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      select: SESSION_FIELDS,
      orderBy: [{ lastUsedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return sessions as SessionRecord[];
  }

  async update(id: string, token: string, expiresAt: Date): Promise<number> {
    const { count } = await this.prisma.jwtRefreshToken.updateMany({
      where: { id },
      data: {
        token: await this.hash(token),
        lastUsedAt: new Date(),
        expiresAt,
      },
    });

    return count;
  }

  async removeSession(id: string): Promise<void> {
    await this.prisma.jwtRefreshToken.deleteMany({ where: { id } });
  }

  async removeSessionOfUser(id: string, userId: string): Promise<number> {
    const { count } = await this.prisma.jwtRefreshToken.deleteMany({
      where: { id, userId },
    });

    return count;
  }

  async removeAllSessionsForUser(userId: string) {
    await this.prisma.jwtRefreshToken.deleteMany({ where: { userId } });
  }

  async removeAllSessionsForUserExcept(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    await this.prisma.jwtRefreshToken.deleteMany({
      where: { userId, id: { not: sessionId } },
    });
  }

  private async hash(text: string): Promise<string> {
    return bcrypt.hash(text, 12);
  }
}
