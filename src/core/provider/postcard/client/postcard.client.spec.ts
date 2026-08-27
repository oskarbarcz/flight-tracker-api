import { PostcardClient } from './postcard.client';
import { PostcardGeneratedBody } from '../type/postcard.types';
import {
  PostcardGeneratorTimedOutError,
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

const munich = {
  city: 'Munich',
  country: 'Germany',
  continent: 'Europe',
  uuid: UUID,
};

const generated: PostcardGeneratedBody = {
  ...munich,
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

    expect(await client.generate(munich)).toEqual({
      key: `postcards/${UUID}.jpg`,
      url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
      drawn: true,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      `${BASE_URL}/city?city=Munich&country=Germany&continent=Europe&uuid=${UUID}` +
        `&size=1152x1536&quality=high&format=jpeg`,
    );
    expect(init.headers['X-Require-Whisk-Auth']).toBe(SECRET);
  });

  it('derives where art it did not wait for will appear, without claiming it is drawn', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        jsonResponse(202, { error: 'Response not yet ready.' }),
      );

    expect(await client.generate(munich)).toEqual({
      key: `postcards/${UUID}.jpg`,
      url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
      drawn: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('accepts art handed to a background render whatever route it went out on', async () => {
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse(202, {
        status: 'accepted',
        key: `postcards/${UUID}.jpg`,
        url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
        handoff: { mode: 'web' },
      }),
    );

    expect(await client.generate(munich)).toEqual({
      key: `postcards/${UUID}.jpg`,
      url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
      drawn: false,
    });
  });

  it('takes art the generator drew inline, so a refused hand-off costs nothing but the wait', async () => {
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse(200, {
        ...generated,
        handoff: { mode: 'inline', reason: 'no public endpoint configured' },
      }),
    );

    expect(await client.generate(munich)).toEqual({
      key: `postcards/${UUID}.jpg`,
      url: `${ART_BASE_URL}/postcards/${UUID}.jpg`,
      drawn: true,
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
      client.generate({
        city: '北京',
        country: 'China',
        continent: 'Asia',
        uuid: UUID,
      }),
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

    await expect(client.generate(munich)).rejects.toBeInstanceOf(
      PostcardGeneratorUnavailableError,
    );
  });

  it('treats an unreachable generator as unavailable', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('connect ECONNREFUSED'));

    await expect(client.generate(munich)).rejects.toBeInstanceOf(
      PostcardGeneratorUnavailableError,
    );
  });

  it('tells a render that outlived the call apart from a generator that is not there', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(
        new DOMException('This operation was aborted', 'AbortError'),
      );

    await expect(client.generate(munich)).rejects.toBeInstanceOf(
      PostcardGeneratorTimedOutError,
    );
  });

  it('confirms stored art by asking the bucket for it', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(headResponse(200));

    expect(await client.confirm(`${ART_BASE_URL}/postcards/${UUID}.jpg`)).toBe(
      true,
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${ART_BASE_URL}/postcards/${UUID}.jpg`);
    expect(init.method).toBe('HEAD');
  });

  it('does not confirm art the bucket does not hold yet', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(headResponse(404));

    expect(await client.confirm(`${ART_BASE_URL}/postcards/${UUID}.jpg`)).toBe(
      false,
    );
  });

  it('does not confirm art it cannot reach the bucket to ask about', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('connect ECONNREFUSED'));

    expect(await client.confirm(`${ART_BASE_URL}/postcards/${UUID}.jpg`)).toBe(
      false,
    );
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
