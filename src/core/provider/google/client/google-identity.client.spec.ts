import { generateKeyPair, JWTPayload, KeyLike, SignJWT } from 'jose';
import { GoogleIdentityClient } from './google-identity.client';
import {
  GoogleEmailNotVerifiedError,
  InvalidGoogleTokenError,
} from '../error/google-identity.error';

const CLIENT_ID = '1234-test.apps.googleusercontent.com';
const ISSUER = 'https://accounts.google.com';

describe('GoogleIdentityClient', () => {
  let privateKey: KeyLike;
  let publicKey: KeyLike;
  let client: GoogleIdentityClient;

  const validClaims = {
    sub: '104778392015664201883',
    email: 'admin@example.com',
    email_verified: true,
    name: 'John Doe',
  };

  beforeAll(async () => {
    const keyPair = await generateKeyPair('RS256');
    privateKey = keyPair.privateKey;
    publicKey = keyPair.publicKey;
  });

  beforeEach(() => {
    client = new GoogleIdentityClient(CLIENT_ID, () => publicKey);
  });

  async function sign(
    claims: JWTPayload,
    overrides: {
      key?: KeyLike;
      issuer?: string;
      audience?: string;
      expiresIn?: string;
    } = {},
  ): Promise<string> {
    return new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setIssuer(overrides.issuer ?? ISSUER)
      .setAudience(overrides.audience ?? CLIENT_ID)
      .setExpirationTime(overrides.expiresIn ?? '1h')
      .sign(overrides.key ?? privateKey);
  }

  it('returns the identity of a valid token', async () => {
    const token = await sign(validClaims);

    await expect(client.verifyIdToken(token)).resolves.toEqual({
      googleId: '104778392015664201883',
      email: 'admin@example.com',
      name: 'John Doe',
    });
  });

  it('accepts the bare accounts.google.com issuer', async () => {
    const token = await sign(validClaims, { issuer: 'accounts.google.com' });

    await expect(client.verifyIdToken(token)).resolves.toMatchObject({
      googleId: '104778392015664201883',
    });
  });

  it('returns a null name when the token omits it', async () => {
    const { name, ...withoutName } = validClaims;
    const token = await sign(withoutName);

    expect(name).toBe('John Doe');
    await expect(client.verifyIdToken(token)).resolves.toMatchObject({
      name: null,
    });
  });

  it('rejects a token signed by an unknown key', async () => {
    const foreign = await generateKeyPair('RS256');
    const token = await sign(validClaims, { key: foreign.privateKey });

    await expect(client.verifyIdToken(token)).rejects.toThrow(
      InvalidGoogleTokenError,
    );
  });

  it('rejects a token issued for another client', async () => {
    const token = await sign(validClaims, {
      audience: '9999-other.apps.googleusercontent.com',
    });

    await expect(client.verifyIdToken(token)).rejects.toThrow(
      InvalidGoogleTokenError,
    );
  });

  it('rejects a token from another issuer', async () => {
    const token = await sign(validClaims, { issuer: 'https://evil.example' });

    await expect(client.verifyIdToken(token)).rejects.toThrow(
      InvalidGoogleTokenError,
    );
  });

  it('rejects an expired token', async () => {
    const token = await sign(validClaims, { expiresIn: '-1h' });

    await expect(client.verifyIdToken(token)).rejects.toThrow(
      InvalidGoogleTokenError,
    );
  });

  it('rejects an unsecured token that claims no algorithm', async () => {
    const header = Buffer.from('{"alg":"none"}').toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ ...validClaims, iss: ISSUER, aud: CLIENT_ID }),
    ).toString('base64url');

    await expect(client.verifyIdToken(`${header}.${payload}.`)).rejects.toThrow(
      InvalidGoogleTokenError,
    );
  });

  it('rejects a token without a subject', async () => {
    const { sub, ...withoutSub } = validClaims;
    const token = await sign(withoutSub);

    expect(sub).toBeDefined();
    await expect(client.verifyIdToken(token)).rejects.toThrow(
      InvalidGoogleTokenError,
    );
  });

  it('rejects a token without an email', async () => {
    const { email, ...withoutEmail } = validClaims;
    const token = await sign(withoutEmail);

    expect(email).toBeDefined();
    await expect(client.verifyIdToken(token)).rejects.toThrow(
      InvalidGoogleTokenError,
    );
  });

  it('rejects a token whose email is not verified', async () => {
    const token = await sign({ ...validClaims, email_verified: false });

    await expect(client.verifyIdToken(token)).rejects.toThrow(
      GoogleEmailNotVerifiedError,
    );
  });
});
