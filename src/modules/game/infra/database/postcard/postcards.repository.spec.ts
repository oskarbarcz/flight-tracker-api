import { PostcardsRepository } from './postcards.repository';
import { PostcardStatus } from '../../../model/postcard/postcard.model';

const POSTCARD_ID = '0f3d6a2e-9c14-4f0b-8a7d-2b5e1c8f4a63';

const NAMED_ART = 'd1f0c7a2-4b58-4e6a-9c3d-8f21a5b6c7d0';

const FRESH_ART = '7c9e6d4b-1a2f-4c8e-b5d3-9f0a1b2c3d4e';

describe('PostcardsRepository.startDrawing', () => {
  let prisma: {
    postcard: { findUniqueOrThrow: jest.Mock; update: jest.Mock };
  };
  let repository: PostcardsRepository;

  beforeEach(() => {
    prisma = {
      postcard: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    repository = new PostcardsRepository(prisma as never);
  });

  it('names art the postcard has never had', async () => {
    prisma.postcard.findUniqueOrThrow.mockResolvedValue({
      artUuid: null,
      imageUrl: null,
      width: null,
      height: null,
    });

    expect(await repository.startDrawing(POSTCARD_ID, FRESH_ART)).toEqual({
      artUuid: FRESH_ART,
      reused: false,
      width: null,
      height: null,
    });

    expect(prisma.postcard.update).toHaveBeenCalledWith({
      where: { id: POSTCARD_ID },
      data: {
        status: PostcardStatus.Pending,
        artUuid: FRESH_ART,
        updatedAt: expect.any(Date),
      },
    });
  });

  it('keeps the name an earlier attempt gave art that never arrived', async () => {
    prisma.postcard.findUniqueOrThrow.mockResolvedValue({
      artUuid: NAMED_ART,
      imageUrl: null,
      width: 1152,
      height: 1536,
    });

    expect(await repository.startDrawing(POSTCARD_ID, FRESH_ART)).toEqual({
      artUuid: NAMED_ART,
      reused: true,
      width: 1152,
      height: 1536,
    });

    expect(prisma.postcard.update).toHaveBeenCalledWith({
      where: { id: POSTCARD_ID },
      data: {
        status: PostcardStatus.Pending,
        artUuid: NAMED_ART,
        updatedAt: expect.any(Date),
      },
    });
  });

  it('names fresh art when the postcard already has art to replace', async () => {
    prisma.postcard.findUniqueOrThrow.mockResolvedValue({
      artUuid: NAMED_ART,
      imageUrl: `https://postcards.example/postcards/${NAMED_ART}.jpg`,
      width: 1152,
      height: 1536,
    });

    expect(await repository.startDrawing(POSTCARD_ID, FRESH_ART)).toEqual({
      artUuid: FRESH_ART,
      reused: false,
      width: null,
      height: null,
    });
  });
});
