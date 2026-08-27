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
  city: { id: string; name: string; country: string };
};

export type ClaimedPostcard = {
  id: string;
  created: boolean;
};

export type CataloguePostcardRecord = PostcardRecord & { heldBy: number };

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

  async startDrawing(id: string, artUuid: string): Promise<void> {
    await this.prisma.postcard.update({
      where: { id },
      data: {
        status: PostcardStatus.Pending,
        artUuid,
        updatedAt: new Date(),
      },
    });
  }

  async recordArt(
    id: string,
    artUuid: string,
    imageUrl: string,
    width: number,
    height: number,
  ): Promise<void> {
    await this.prisma.postcard.update({
      where: { id },
      data: {
        status: PostcardStatus.Ready,
        artUuid,
        imageUrl,
        width,
        height,
        updatedAt: new Date(),
      },
    });
  }

  async recordFailure(id: string): Promise<void> {
    await this.prisma.postcard.update({
      where: { id },
      data: { status: PostcardStatus.Failed, updatedAt: new Date() },
    });
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
