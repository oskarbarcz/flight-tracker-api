import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { PostcardStatus } from '../../../model/postcard/postcard.model';

const selectPostcard = {
  id: true,
  cityId: true,
  status: true,
  artUuid: true,
  imageUrl: true,
  width: true,
  height: true,
  failureReason: true,
  updatedAt: true,
  city: { select: { id: true, name: true, country: true } },
} as const;

export type PostcardRecord = {
  id: string;
  cityId: string;
  status: PostcardStatus;
  artUuid: string | null;
  imageUrl: string | null;
  width: number | null;
  height: number | null;
  failureReason: string | null;
  updatedAt: Date | null;
  city: { id: string; name: string; country: string };
};

export type ClaimedPostcard = {
  id: string;
  created: boolean;
};

export type StartedDrawing = {
  artUuid: string;
  reused: boolean;
  width: number | null;
  height: number | null;
};

export type CataloguePostcardRecord = PostcardRecord & { heldBy: number };

export type PostcardAwaitingArt = {
  id: string;
  artUuid: string;
  width: number | null;
  height: number | null;
  startedAt: Date;
  city: { name: string; country: string };
};

type PostcardRow = Omit<PostcardRecord, 'status'> & { status: string };

function toRecord(row: PostcardRow): PostcardRecord {
  return { ...row, status: row.status as PostcardStatus };
}

@Injectable()
export class PostcardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async claimForCity(id: string, cityId: string): Promise<ClaimedPostcard> {
    const { count } = await this.prisma.postcard.createMany({
      data: [{ id, cityId }],
      skipDuplicates: true,
    });

    const postcard = await this.prisma.postcard.findUniqueOrThrow({
      where: { cityId },
      select: { id: true },
    });

    return { id: postcard.id, created: count === 1 };
  }

  async findById(id: string): Promise<PostcardRecord | null> {
    const postcard = await this.prisma.postcard.findUnique({
      where: { id },
      select: selectPostcard,
    });

    return postcard ? toRecord(postcard) : null;
  }

  async findByCity(cityId: string): Promise<PostcardRecord | null> {
    const postcard = await this.prisma.postcard.findUnique({
      where: { cityId },
      select: selectPostcard,
    });

    return postcard ? toRecord(postcard) : null;
  }

  async startDrawing(id: string, artUuid: string): Promise<StartedDrawing> {
    const postcard = await this.prisma.postcard.findUniqueOrThrow({
      where: { id },
      select: {
        artUuid: true,
        imageUrl: true,
        width: true,
        height: true,
      },
    });

    const unclaimed = postcard.imageUrl ? null : postcard.artUuid;
    const reused = unclaimed !== null;
    const started = {
      artUuid: unclaimed ?? artUuid,
      reused,
      width: reused ? postcard.width : null,
      height: reused ? postcard.height : null,
    };

    await this.prisma.postcard.update({
      where: { id },
      data: {
        status: PostcardStatus.Pending,
        artUuid: started.artUuid,
        updatedAt: new Date(),
      },
    });

    return started;
  }

  async recordArtSize(
    id: string,
    artUuid: string,
    width: number | null,
    height: number | null,
  ): Promise<boolean> {
    const { count } = await this.prisma.postcard.updateMany({
      where: { id, artUuid },
      data: { width, height, updatedAt: new Date() },
    });

    return count > 0;
  }

  // Drawing happens in the background, so a result can arrive after the postcard has moved on —
  // redrawn under a new art uuid, or reset. The write is therefore conditional on the postcard
  // still being on the drawing the result belongs to; a stale result updates nothing.
  async recordArt(
    id: string,
    artUuid: string,
    imageUrl: string,
    width: number | null,
    height: number | null,
  ): Promise<boolean> {
    const { count } = await this.prisma.postcard.updateMany({
      where: { id, artUuid },
      data: {
        status: PostcardStatus.Ready,
        imageUrl,
        width,
        height,
        failureReason: null,
        updatedAt: new Date(),
      },
    });

    return count > 0;
  }

  async recordFailure(
    id: string,
    artUuid: string,
    reason: string,
  ): Promise<boolean> {
    const { count } = await this.prisma.postcard.updateMany({
      where: { id, artUuid },
      data: {
        status: PostcardStatus.Failed,
        failureReason: reason,
        updatedAt: new Date(),
      },
    });

    return count > 0;
  }

  async listCitiesWithoutArt(): Promise<
    { id: string; name: string; country: string }[]
  > {
    return this.prisma.city.findMany({
      where: {
        OR: [
          { postcard: { is: null } },
          { postcard: { imageUrl: null, artUuid: null } },
          { postcard: { imageUrl: null, status: PostcardStatus.Failed } },
        ],
      },
      select: { id: true, name: true, country: true },
      orderBy: { name: 'asc' },
    });
  }

  async listCityIdsWithPostcard(): Promise<string[]> {
    const postcards = await this.prisma.postcard.findMany({
      select: { cityId: true },
    });

    return postcards.map((postcard) => postcard.cityId);
  }

  async listAwaitingArt(): Promise<PostcardAwaitingArt[]> {
    const postcards = await this.prisma.postcard.findMany({
      where: { status: PostcardStatus.Pending, artUuid: { not: null } },
      select: {
        id: true,
        artUuid: true,
        width: true,
        height: true,
        createdAt: true,
        updatedAt: true,
        city: { select: { name: true, country: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return postcards.map((postcard) => ({
      id: postcard.id,
      artUuid: postcard.artUuid as string,
      width: postcard.width,
      height: postcard.height,
      startedAt: postcard.updatedAt ?? postcard.createdAt,
      city: postcard.city,
    }));
  }

  async count(): Promise<number> {
    return this.prisma.postcard.count();
  }

  async listCatalogue(): Promise<CataloguePostcardRecord[]> {
    const postcards = await this.prisma.postcard.findMany({
      select: { ...selectPostcard, _count: { select: { holders: true } } },
      orderBy: { city: { name: 'asc' } },
    });

    return postcards.map(({ _count, ...postcard }) => ({
      ...toRecord(postcard),
      heldBy: _count.holders,
    }));
  }
}
