import {
  GeneratePostcardCommand,
  GeneratePostcardHandler,
} from './generate-postcard.command';
import {
  PostcardsRepository,
  StartedDrawing,
} from '../../../infra/database/postcard/postcards.repository';
import { PostcardClient } from '../../../../../core/provider/postcard/client/postcard.client';
import {
  PostcardGeneratorTimedOutError,
  PostcardGeneratorUnavailableError,
  PostcardRejectedError,
} from '../../../../../core/provider/postcard/error/postcard.error';

const POSTCARD_ID = '0f3d6a2e-9c14-4f0b-8a7d-2b5e1c8f4a63';

const CITY_ID = 'e8e8d77d-4b22-42cb-b163-13d54eec3597';

const ART_UUID = 'd1f0c7a2-4b58-4e6a-9c3d-8f21a5b6c7d0';

const ART_URL = `https://postcards.example/postcards/${ART_UUID}.jpg`;

const command = new GeneratePostcardCommand(CITY_ID, 'Cologne', 'DE');

function fakeRepository(
  started: Partial<StartedDrawing> = {},
): jest.Mocked<PostcardsRepository> {
  return {
    claimForCity: jest
      .fn()
      .mockResolvedValue({ id: POSTCARD_ID, created: false }),
    startDrawing: jest
      .fn()
      .mockResolvedValue({ artUuid: ART_UUID, reused: false, ...started }),
    recordArt: jest.fn().mockResolvedValue(undefined),
    recordFailure: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<PostcardsRepository>;
}

function fakeClient(
  overrides: Partial<jest.Mocked<PostcardClient>> = {},
): jest.Mocked<PostcardClient> {
  return {
    locate: jest.fn().mockImplementation((uuid: string) => ({
      key: `postcards/${uuid}.jpg`,
      url: `https://postcards.example/postcards/${uuid}.jpg`,
    })),
    confirm: jest.fn().mockResolvedValue(false),
    generate: jest.fn().mockResolvedValue({
      key: `postcards/${ART_UUID}.jpg`,
      url: ART_URL,
      drawn: true,
    }),
    ...overrides,
  } as unknown as jest.Mocked<PostcardClient>;
}

describe('GeneratePostcardHandler', () => {
  it('draws under the art name the postcard already stands on and records the art', async () => {
    const repository = fakeRepository();
    const client = fakeClient();

    const handler = new GeneratePostcardHandler(repository, client);
    expect(await handler.execute(command)).toBe(POSTCARD_ID);

    expect(client.generate).toHaveBeenCalledWith({
      city: 'Cologne',
      country: 'Germany',
      continent: 'Europe',
      uuid: ART_UUID,
    });
    expect(repository.recordArt).toHaveBeenCalledWith(
      POSTCARD_ID,
      ART_UUID,
      ART_URL,
      1152,
      1536,
    );
    expect(repository.recordFailure).not.toHaveBeenCalled();
  });

  it('leaves the postcard pending when the generator took the render for the background', async () => {
    const repository = fakeRepository();
    const client = fakeClient({
      generate: jest.fn().mockResolvedValue({
        key: `postcards/${ART_UUID}.jpg`,
        url: ART_URL,
        drawn: false,
      }),
    });

    const handler = new GeneratePostcardHandler(repository, client);
    await handler.execute(command);

    expect(repository.recordArt).not.toHaveBeenCalled();
    expect(repository.recordFailure).not.toHaveBeenCalled();
  });

  it('leaves the postcard pending when the render outlived the call, because the art may still appear', async () => {
    const repository = fakeRepository();
    const client = fakeClient({
      generate: jest
        .fn()
        .mockRejectedValue(new PostcardGeneratorTimedOutError()),
    });

    const handler = new GeneratePostcardHandler(repository, client);
    await handler.execute(command);

    expect(repository.recordArt).not.toHaveBeenCalled();
    expect(repository.recordFailure).not.toHaveBeenCalled();
  });

  it('records a failure when the generator is unavailable, because nothing is being drawn', async () => {
    const repository = fakeRepository();
    const client = fakeClient({
      generate: jest
        .fn()
        .mockRejectedValue(new PostcardGeneratorUnavailableError()),
    });

    const handler = new GeneratePostcardHandler(repository, client);
    await handler.execute(command);

    expect(repository.recordFailure).toHaveBeenCalledWith(
      POSTCARD_ID,
      'Postcard generator is unavailable.',
    );
  });

  it('records a failure the generator will not reconsider', async () => {
    const repository = fakeRepository();
    const client = fakeClient({
      generate: jest
        .fn()
        .mockRejectedValue(new PostcardRejectedError('city is not a place')),
    });

    const handler = new GeneratePostcardHandler(repository, client);
    await handler.execute(command);

    expect(repository.recordFailure).toHaveBeenCalledWith(
      POSTCARD_ID,
      'The generator will not draw "Cologne, Germany": Postcard generator rejected the request: city is not a place',
    );
  });

  it('adopts art an earlier attempt already stored rather than paying for it twice', async () => {
    const repository = fakeRepository({ reused: true });
    const client = fakeClient({ confirm: jest.fn().mockResolvedValue(true) });

    const handler = new GeneratePostcardHandler(repository, client);
    await handler.execute(command);

    expect(client.confirm).toHaveBeenCalledWith(ART_URL);
    expect(client.generate).not.toHaveBeenCalled();
    expect(repository.recordArt).toHaveBeenCalledWith(
      POSTCARD_ID,
      ART_UUID,
      ART_URL,
      1152,
      1536,
    );
  });

  it('draws again under the reused name when the earlier attempt stored nothing', async () => {
    const repository = fakeRepository({ reused: true });
    const client = fakeClient();

    const handler = new GeneratePostcardHandler(repository, client);
    await handler.execute(command);

    expect(client.confirm).toHaveBeenCalledWith(ART_URL);
    expect(client.generate).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: ART_UUID }),
    );
  });

  it('does not ask the bucket about art no earlier attempt named', async () => {
    const repository = fakeRepository();
    const client = fakeClient();

    const handler = new GeneratePostcardHandler(repository, client);
    await handler.execute(command);

    expect(client.confirm).not.toHaveBeenCalled();
  });
});
