import {
  DiscordIdentityClient,
  parseAllowedRedirectUris,
} from './discord-identity.client';
import {
  DiscordRedirectUriNotAllowedError,
  DiscordUnreachableError,
  InvalidDiscordAuthorizationCodeError,
} from '../error/discord-identity.error';
import { buildDiscordAvatarUrl } from '../types/discord-identity.types';

const REDIRECT_URI = 'https://flights.barcz.me/auth/discord/callback';
const CONFIG = {
  baseUrl: 'https://discord.com/api',
  clientId: '100000000000000010',
  clientSecret: 'client-secret',
  allowedRedirectUris: [REDIRECT_URI],
  serverId: '100000000000000020',
  botToken: 'bot-token',
};

function jsonResponse(status: number, body: unknown = {}): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('DiscordIdentityClient', () => {
  let client: DiscordIdentityClient;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    client = new DiscordIdentityClient(CONFIG);
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('exchangeCode', () => {
    it('posts the PKCE verifier and client credentials to the token endpoint', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, { access_token: 'user-token', scope: 'identify' }),
      );

      await client.exchangeCode('the-code', REDIRECT_URI, 'the-verifier');

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://discord.com/api/oauth2/token');
      expect(init.method).toBe('POST');
      expect(
        Object.fromEntries(new URLSearchParams(init.body as string)),
      ).toEqual({
        client_id: CONFIG.clientId,
        client_secret: CONFIG.clientSecret,
        grant_type: 'authorization_code',
        code: 'the-code',
        redirect_uri: REDIRECT_URI,
        code_verifier: 'the-verifier',
      });
    });

    it('reports the granted scopes so a requested server join can be checked', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, {
          access_token: 'user-token',
          scope: 'identify guilds.join',
        }),
      );

      const authorization = await client.exchangeCode(
        'the-code',
        REDIRECT_URI,
        'the-verifier',
      );

      expect(authorization).toEqual({
        accessToken: 'user-token',
        scopes: ['identify', 'guilds.join'],
      });
    });

    it('refuses a redirect uri outside the allowlist before calling Discord', async () => {
      await expect(
        client.exchangeCode(
          'the-code',
          'https://attacker.example.com/cb',
          'the-verifier',
        ),
      ).rejects.toBeInstanceOf(DiscordRedirectUriNotAllowedError);

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects a code Discord refuses', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(400, { error: 'invalid_grant' }),
      );

      await expect(
        client.exchangeCode('spent-code', REDIRECT_URI, 'the-verifier'),
      ).rejects.toBeInstanceOf(InvalidDiscordAuthorizationCodeError);
    });

    it('separates a Discord outage from a bad code', async () => {
      fetchMock.mockResolvedValue(jsonResponse(503));

      await expect(
        client.exchangeCode('the-code', REDIRECT_URI, 'the-verifier'),
      ).rejects.toBeInstanceOf(DiscordUnreachableError);
    });

    it('treats an unreachable Discord as an upstream failure', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(
        client.exchangeCode('the-code', REDIRECT_URI, 'the-verifier'),
      ).rejects.toBeInstanceOf(DiscordUnreachableError);
    });
  });

  describe('getCurrentUser', () => {
    it('reads the identity with the user access token', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, {
          id: '100000000000000100',
          username: 'michael.doe',
          global_name: 'Michael Doe',
          avatar: 'b1c2d3e4f5061728394a5b6c7d8e9f00',
        }),
      );

      const identity = await client.getCurrentUser('user-token');

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://discord.com/api/users/@me');
      expect(init.headers).toMatchObject({
        Authorization: 'Bearer user-token',
      });
      expect(identity).toEqual({
        discordId: '100000000000000100',
        username: 'michael.doe',
        globalName: 'Michael Doe',
        avatar: 'b1c2d3e4f5061728394a5b6c7d8e9f00',
      });
    });

    it('keeps an account without a display name or avatar readable', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, { id: '1', username: 'loner' }),
      );

      const identity = await client.getCurrentUser('user-token');

      expect(identity.globalName).toBeNull();
      expect(identity.avatar).toBeNull();
    });

    it('rejects an incomplete profile rather than linking a partial identity', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, { username: 'nameless' }));

      await expect(client.getCurrentUser('user-token')).rejects.toBeInstanceOf(
        DiscordUnreachableError,
      );
    });
  });

  describe('addGuildMember', () => {
    it('adds the member with the bot token and the user access token', async () => {
      fetchMock.mockResolvedValue(jsonResponse(201, {}));

      const outcome = await client.addGuildMember('42', 'user-token');

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(
        'https://discord.com/api/guilds/100000000000000020/members/42',
      );
      expect(init.method).toBe('PUT');
      expect(init.headers).toMatchObject({
        Authorization: 'Bot bot-token',
      });
      expect(JSON.parse(init.body as string)).toEqual({
        access_token: 'user-token',
      });
      expect(outcome).toBe('joined');
    });

    it('reports an empty response as an account that was already there', async () => {
      fetchMock.mockResolvedValue(jsonResponse(204));

      await expect(client.addGuildMember('42', 'user-token')).resolves.toBe(
        'already_member',
      );
    });

    it('reports a refused join without failing the link', async () => {
      fetchMock.mockResolvedValue(jsonResponse(403, { code: 50013 }));

      await expect(client.addGuildMember('42', 'user-token')).resolves.toBe(
        'failed',
      );
    });

    it('reports an unreachable Discord without failing the link', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(client.addGuildMember('42', 'user-token')).resolves.toBe(
        'failed',
      );
    });
  });
});

describe('parseAllowedRedirectUris', () => {
  it('splits and trims the configured list', () => {
    expect(
      parseAllowedRedirectUris(
        ' http://localhost:5173/auth/discord/callback , https://flights.barcz.me/auth/discord/callback ',
      ),
    ).toEqual([
      'http://localhost:5173/auth/discord/callback',
      'https://flights.barcz.me/auth/discord/callback',
    ]);
  });

  it('ignores empty entries so a trailing comma is harmless', () => {
    expect(parseAllowedRedirectUris('https://a.example/cb,,')).toEqual([
      'https://a.example/cb',
    ]);
  });
});

describe('buildDiscordAvatarUrl', () => {
  it('serves animated avatars as gif', () => {
    expect(buildDiscordAvatarUrl('42', 'a_1234')).toBe(
      'https://cdn.discordapp.com/avatars/42/a_1234.gif',
    );
  });

  it('serves still avatars as png', () => {
    expect(buildDiscordAvatarUrl('42', 'abcd')).toBe(
      'https://cdn.discordapp.com/avatars/42/abcd.png',
    );
  });

  it('has no url for an account without an avatar', () => {
    expect(buildDiscordAvatarUrl('42', null)).toBeNull();
    expect(buildDiscordAvatarUrl(null, 'abcd')).toBeNull();
  });
});
