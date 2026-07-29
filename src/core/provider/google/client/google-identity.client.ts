import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import {
  createRemoteJWKSet,
  JWTPayload,
  JWTVerifyGetKey,
  jwtVerify,
} from 'jose';
import { GoogleIdentity } from '../type/google-identity.types';
import {
  GoogleEmailNotVerifiedError,
  InvalidGoogleTokenError,
} from '../error/google-identity.error';
import { getErrorMessage } from '../../../utils/error-message';

const DEFAULT_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

const JWKS_TIMEOUT_MS = 10000;
const JWKS_COOLDOWN_MS = 30000;
const JWKS_CACHE_MAX_AGE_MS = 600000;
const CLOCK_TOLERANCE_SECONDS = 30;

type GoogleIdTokenClaims = JWTPayload & {
  email?: string;
  email_verified?: boolean;
  name?: string;
};

export type GoogleSigningKeys = JWTVerifyGetKey;

@Injectable()
export class GoogleIdentityClient {
  private readonly logger = new Logger(GoogleIdentityClient.name);

  constructor(
    private readonly clientId: string,
    private readonly signingKeys: GoogleSigningKeys,
  ) {}

  async verifyIdToken(idToken: string): Promise<GoogleIdentity> {
    const claims = await this.verifyClaims(idToken);

    if (!claims.sub || !claims.email) {
      throw new InvalidGoogleTokenError();
    }

    if (claims.email_verified !== true) {
      throw new GoogleEmailNotVerifiedError();
    }

    return {
      googleId: claims.sub,
      email: claims.email,
      name: claims.name ?? null,
    };
  }

  private async verifyClaims(idToken: string): Promise<GoogleIdTokenClaims> {
    try {
      const { payload } = await jwtVerify<GoogleIdTokenClaims>(
        idToken,
        this.signingKeys,
        {
          algorithms: ['RS256'],
          audience: this.clientId,
          issuer: GOOGLE_ISSUERS,
          clockTolerance: CLOCK_TOLERANCE_SECONDS,
        },
      );

      return payload;
    } catch (error) {
      this.logger.warn(`Rejected Google ID token: ${getErrorMessage(error)}`);

      throw new InvalidGoogleTokenError();
    }
  }
}

export const GoogleIdentityClientProvider = {
  provide: GoogleIdentityClient,
  useFactory: (config: ConfigService) => {
    const clientId = config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const jwksUri = config.get<string>('GOOGLE_JWKS_URI') ?? DEFAULT_JWKS_URI;

    const signingKeys = createRemoteJWKSet(new URL(jwksUri), {
      timeoutDuration: JWKS_TIMEOUT_MS,
      cooldownDuration: JWKS_COOLDOWN_MS,
      cacheMaxAge: JWKS_CACHE_MAX_AGE_MS,
    });

    return new GoogleIdentityClient(clientId, signingKeys);
  },
  inject: [ConfigService],
};
