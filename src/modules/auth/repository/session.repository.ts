import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async new(userId: string, sessionId: string, token: string) {
    await this.prisma.jwtRefreshToken.create({
      data: {
        id: sessionId,
        token: await this.hash(token),
        createdAt: new Date(),
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async update(id: string, token: string): Promise<void> {
    await this.prisma.jwtRefreshToken.update({
      where: { id },
      data: {
        token: await this.hash(token),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async removeSession(id: string): Promise<void> {
    await this.prisma.jwtRefreshToken.delete({ where: { id } });
  }

  async removeAllSessionsForUser(userId: string) {
    await this.prisma.jwtRefreshToken.deleteMany({ where: { userId } });
  }

  private async hash(text: string): Promise<string> {
    return bcrypt.hash(text, 12);
  }
}
