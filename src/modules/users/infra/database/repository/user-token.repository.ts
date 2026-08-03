import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  UserToken,
  UserTokenType,
} from '../../../../../../prisma/client/client';

const TOKEN_BYTES = 32;

export function hashUserToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export type IssuedToken = { id: string; rawToken: string };

@Injectable()
export class UserTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async issue(
    userId: string,
    type: UserTokenType,
    ttlMs: number,
    newEmail?: string,
  ): Promise<IssuedToken> {
    const rawToken = randomBytes(TOKEN_BYTES).toString('base64url');

    const { id } = await this.prisma.$transaction(async (tx) => {
      await tx.userToken.deleteMany({ where: { userId, type } });

      return tx.userToken.create({
        data: {
          userId,
          type,
          tokenHash: hashUserToken(rawToken),
          newEmail: newEmail ?? null,
          expiresAt: new Date(Date.now() + ttlMs),
        },
      });
    });

    return { id, rawToken };
  }

  async deleteAllFor(userId: string, type: UserTokenType): Promise<void> {
    await this.prisma.userToken.deleteMany({ where: { userId, type } });
  }

  async findValid(
    type: UserTokenType,
    rawToken: string,
  ): Promise<UserToken | null> {
    return this.prisma.userToken.findFirst({
      where: {
        type,
        tokenHash: hashUserToken(rawToken),
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findPending(
    userId: string,
    type: UserTokenType,
  ): Promise<UserToken | null> {
    return this.prisma.userToken.findFirst({
      where: {
        userId,
        type,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findRecentUnconsumed(
    userId: string,
    type: UserTokenType,
    withinMs: number,
  ): Promise<UserToken | null> {
    return this.prisma.userToken.findFirst({
      where: {
        userId,
        type,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        createdAt: { gt: new Date(Date.now() - withinMs) },
      },
    });
  }

  /**
   * Marks the token used, and reports whether this call is the one that did it.
   * The conditional update is what makes a token single-use under concurrency:
   * of two callers holding the same valid token, exactly one gets `true`.
   */
  async consume(id: string): Promise<boolean> {
    const { count } = await this.prisma.userToken.updateMany({
      where: { id, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    return count === 1;
  }
}
