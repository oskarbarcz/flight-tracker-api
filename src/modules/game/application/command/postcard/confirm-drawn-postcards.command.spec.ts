import { ConfirmDrawnPostcardsHandler } from './confirm-drawn-postcards.command';
import {
  PostcardAwaitingArt,
  PostcardsRepository,
} from '../../../infra/database/postcard/postcards.repository';
import { PostcardClient } from '../../../../../core/provider/postcard/client/postcard.client';

const NOW = new Date('2026-08-27T12:00:00.000Z');

const ART_UUID = 'd1f0c7a2-4b58-4e6a-9c3d-8f21a5b6c7d0';

const ART_URL = `https://postcards.example/postcards/${ART_UUID}.jpg`;

function awaiting(
  overrides: Partial<PostcardAwaitingArt> = {},
): PostcardAwaitingArt {
  return {
    id: '0f3d6a2e-9c14-4f0b-8a7d-2b5e1c8f4a63',
    artUuid: ART_UUID,
    width: 1152,
    height: 1536,
    startedAt: new Date(NOW.getTime() - 60 * 1000),
    city: { name: 'Munich', country: 'DE' },
    ...overrides,
  };
}

function fakeRepository(
  postcards: PostcardAwaitingArt[],
): jest.Mocked<PostcardsRepository> {
  return {
    listAwaitingArt: jest.fn().mockResolvedValue(postcards),
    recordArt: jest.fn().mockResolvedValue(undefined),
    recordFailure: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<PostcardsRepository>;
}

function fakeClient(confirmed: boolean): jest.Mocked<PostcardClient> {
  return {
    locate: jest.fn().mockImplementation((uuid: string) => ({
      key: `postcards/${uuid}.jpg`,
      url: `https://postcards.example/postcards/${uuid}.jpg`,
    })),
    confirm: jest.fn().mockResolvedValue(confirmed),
  } as unknown as jest.Mocked<PostcardClient>;
}

describe('ConfirmDrawnPostcardsHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('records the art once the bucket holds it', async () => {
    const repository = fakeRepository([awaiting()]);
    const client = fakeClient(true);

    const handler = new ConfirmDrawnPostcardsHandler(repository, client);
    await handler.execute();

    expect(client.confirm).toHaveBeenCalledWith(ART_URL);
    expect(repository.recordArt).toHaveBeenCalledWith(
      '0f3d6a2e-9c14-4f0b-8a7d-2b5e1c8f4a63',
      ART_UUID,
      ART_URL,
      1152,
      1536,
    );
    expect(repository.recordFailure).not.toHaveBeenCalled();
  });

  it('leaves art that is still being drawn pending rather than calling it a failure', async () => {
    const repository = fakeRepository([awaiting()]);

    const handler = new ConfirmDrawnPostcardsHandler(
      repository,
      fakeClient(false),
    );
    await handler.execute();

    expect(repository.recordArt).not.toHaveBeenCalled();
    expect(repository.recordFailure).not.toHaveBeenCalled();
  });

  it('gives up on art that never arrived once the generator has had long enough', async () => {
    const startedAt = new Date(NOW.getTime() - 16 * 60 * 1000);
    const repository = fakeRepository([awaiting({ startedAt })]);

    const handler = new ConfirmDrawnPostcardsHandler(
      repository,
      fakeClient(false),
    );
    await handler.execute();

    expect(repository.recordArt).not.toHaveBeenCalled();
    expect(repository.recordFailure).toHaveBeenCalledWith(
      '0f3d6a2e-9c14-4f0b-8a7d-2b5e1c8f4a63',
      `The generator took the art but never delivered it to postcards/${ART_UUID}.jpg`,
    );
  });

  it('still waits on art asked for the very moment the deadline is measured from', async () => {
    const repository = fakeRepository([awaiting({ startedAt: NOW })]);

    const handler = new ConfirmDrawnPostcardsHandler(
      repository,
      fakeClient(false),
    );
    await handler.execute();

    expect(repository.recordFailure).not.toHaveBeenCalled();
  });

  it('settles every postcard waiting for art, not just the first', async () => {
    const other = '7c9e6d4b-1a2f-4c8e-b5d3-9f0a1b2c3d4e';
    const repository = fakeRepository([
      awaiting(),
      awaiting({ id: other, artUuid: other }),
    ]);

    const handler = new ConfirmDrawnPostcardsHandler(
      repository,
      fakeClient(true),
    );
    await handler.execute();

    expect(repository.recordArt).toHaveBeenCalledTimes(2);
  });

  it('asks for nothing when no postcard is waiting for art', async () => {
    const repository = fakeRepository([]);
    const client = fakeClient(true);

    const handler = new ConfirmDrawnPostcardsHandler(repository, client);
    await handler.execute();

    expect(client.confirm).not.toHaveBeenCalled();
  });
});
