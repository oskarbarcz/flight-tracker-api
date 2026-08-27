import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { PostcardStatus } from '../../../model/postcard/postcard.model';

export type HeldPostcard = {
  id: string;
  awardedAt: Date;
  seenAt: Date | null;
  postcard: {
    id: string;
    status: PostcardStatus;
    imageUrl: string | null;
    width: number | null;
    height: number | null;
    city: { id: string; name: string; country: string };
  };
};

type HeldPostcardRow = Omit<HeldPostcard, 'postcard'> & {
  postcard: Omit<HeldPostcard['postcard'], 'status'> & { status: string };
};

function toHeld(row: HeldPostcardRow): HeldPostcard {
  return {
    ...row,
    postcard: {
      ...row.postcard,
      status: row.postcard.status as PostcardStatus,
    },
  };
}

@Injectable()
export class UserPostcardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async award(
    id: string,
    userId: string,
    postcardId: string,
    awardedAt: Date,
  ): Promise<void> {
    await this.prisma.userPostcard.createMany({
      data: [{ id, userId, postcardId, awardedAt }],
      skipDuplicates: true,
    });
  }

  async listForUser(userId: string): Promise<HeldPostcard[]> {
    const held = await this.prisma.userPostcard.findMany({
      where: { userId },
      orderBy: { awardedAt: 'asc' },
      select: {
        id: true,
        awardedAt: true,
        seenAt: true,
        postcard: {
          select: {
            id: true,
            status: true,
            imageUrl: true,
            width: true,
            height: true,
            city: { select: { id: true, name: true, country: true } },
          },
        },
      },
    });

    return held.map(toHeld);
  }

  async findHeld(
    userId: string,
    postcardId: string,
  ): Promise<HeldPostcard | null> {
    const held = await this.prisma.userPostcard.findUnique({
      where: { userId_postcardId: { userId, postcardId } },
      select: {
        id: true,
        awardedAt: true,
        seenAt: true,
        postcard: {
          select: {
            id: true,
            status: true,
            imageUrl: true,
            width: true,
            height: true,
            city: { select: { id: true, name: true, country: true } },
          },
        },
      },
    });

    return held ? toHeld(held) : null;
  }

  async markSeen(userId: string, postcardId: string): Promise<void> {
    await this.prisma.userPostcard.updateMany({
      where: { userId, postcardId, seenAt: null },
      data: { seenAt: new Date() },
    });
  }
}
