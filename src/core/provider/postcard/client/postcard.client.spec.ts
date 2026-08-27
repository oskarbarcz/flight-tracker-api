import { PostcardClient } from './postcard.client';
import { PostcardGeneratedBody } from '../type/postcard.types';
import {
  PostcardGeneratorUnavailableError,
  PostcardRejectedError,
} from '../error/postcard.error';

const BASE_URL = 'https://faas.example/postcard-generator/postcard';

const ART_BASE_URL = 'https://files.example';

const SECRET = 'shared-secret';

const UUID = '3f2a1b4c-5d6e-4f70-8a9b-0c1d2e3f4a5b';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

function headResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
  } as Response;
}

const generated: PostcardGeneratedBody = {
  city: 'Munich',
  uuid: UUID,
  model: 'gpt-image-2',
  size: '1152x1536',
  quality: 'high',
  format: 'jpeg',
  contentType: 'image/jpeg',
  bytes: 312044,
  prompt: 'TARGET_CITY = "Munich"',
  key: `postcards/${UUID}.jpg`,
  url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
};

describe('PostcardClient', () => {
  let fetchMock: jest.SpyInstance;

  const client = new PostcardClient(BASE_URL, SECRET, ART_BASE_URL);

  afterEach(() => {
    fetchMock?.mockRestore();
  });

  it('asks the generator to draw a city and returns where it was stored', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, generated));

    expect(await client.generate({ city: 'Munich', uuid: UUID })).toEqual({
      key: `postcards/${UUID}.jpg`,
      url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
      confirmed: true,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      `${BASE_URL}/city?city=Munich&uuid=${UUID}&size=1152x1536&quality=high&format=jpeg`,
    );
    expect(init.headers['X-Require-Whisk-Auth']).toBe(SECRET);
  });

  it('derives the stored location and confirms it when the work outlives the window', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        jsonResponse(202, { error: 'Response not yet ready.' }),
      )
      .mockResolvedValueOnce(headResponse(200));

    expect(await client.generate({ city: 'Munich', uuid: UUID })).toEqual({
      key: `postcards/${UUID}.jpg`,
      url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
      confirmed: true,
    });

    const [confirmUrl, confirmInit] = fetchMock.mock.calls[1];
    expect(confirmUrl).toBe(`${ART_BASE_URL}/postcards/${UUID}.jpg`);
    expect(confirmInit.method).toBe('HEAD');
  });

  it('reports art unconfirmed when the stored object cannot be found', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        jsonResponse(202, { error: 'Response not yet ready.' }),
      )
      .mockResolvedValue(headResponse(404));

    expect(await client.generate({ city: 'Munich', uuid: UUID })).toEqual({
      key: `postcards/${UUID}.jpg`,
      url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
      confirmed: false,
    });
  });

  it('rejects a request the generator will not accept without retrying', async () => {
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse(400, {
        error: {
          code: 'BAD_REQUEST',
          message:
            'Parameter city may only contain Latin letters, digits, spaces, apostrophes and dots.',
          status: 400,
        },
      }),
    );

    await expect(
      client.generate({ city: '北京', uuid: UUID }),
    ).rejects.toBeInstanceOf(PostcardRejectedError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('treats a rejected secret as the generator being unavailable', async () => {
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse(401, {
        code: '1cbe74760de2d9cfb5f9a46129004695',
        error:
          'Authentication is possible but has failed or not yet been provided.',
      }),
    );

    await expect(
      client.generate({ city: 'Munich', uuid: UUID }),
    ).rejects.toBeInstanceOf(PostcardGeneratorUnavailableError);
  });

  it('treats an unreachable generator as unavailable', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('connect ECONNREFUSED'));

    await expect(
      client.generate({ city: 'Munich', uuid: UUID }),
    ).rejects.toBeInstanceOf(PostcardGeneratorUnavailableError);
  });

  it('names the stored object from the uuid and the format', () => {
    expect(client.locate(UUID)).toEqual({
      key: `postcards/${UUID}.jpg`,
      url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
    });

    expect(client.locate(UUID, 'png')).toEqual({
      key: `postcards/${UUID}.png`,
      url: `${ART_BASE_URL}/postcards/${UUID}.png`,
    });
  });
});
