import { Prisma, UserTokenType } from '../../client/client';
import { hashUserToken } from '../../../src/modules/users/infra/database/repository/user-token.repository';

export const EMAIL_CHANGE_TOKENS = {
  // Michael Doe — usable once, confirms a move to michael.new@example.com
  valid: 'uvlKqgdSTj27i866aP-TPZNFJBO9hwLs6K0f8Zq-Pek',
  // Emma Doe — issued and never used, but past its 24 hour window
  expired: 'o7_vOW-CXcI2YIyYYb3v4TBJPz4RLOK3dfAjCuEIzOE',
  // Diana Doe — already confirmed once
  consumed: 'z5gfkDZtIwvOx9s20TdEcLqSJ7szBbLy9FbWUtW_QX4',
  // Claudia Doe — points at an address another seeded user holds
  collision: 'iYST-I0VbklehvJE9kpRgoEbJqC46CaGo-jrEhEfvwo',
};

export const PASSWORD_RESET_TOKENS = {
  // Abby Doe — usable once
  valid: 'h0zosXYrXeB05JxFBhFTPMGntcM8gMiAplsRElzD_vs',
  // Alan Doe — issued and never used, but past its 1 hour window
  expired: 'G0qdrsEIlUfcCu-WPs9JDn7ZH0BgW0UbxBodS7HoOqs',
  // Michael Doe — already used once
  consumed: 'B9MIQwGFaPIYg06E0y0acO3-7lJDSdXtizaC-DV-Tag',
};

export async function loadUserTokens(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const tokens: Prisma.UserTokenCreateManyInput[] = [
    {
      id: '3868ae3a-d794-419b-93e5-2307f6b149ca',
      userId: '629be07f-5e65-429a-9d69-d34b99185f50', // Michael Doe
      type: UserTokenType.email_change,
      tokenHash: hashUserToken(EMAIL_CHANGE_TOKENS.valid),
      newEmail: 'michael.new@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2036-01-01T00:00:00.000Z'),
      consumedAt: null,
    },
    {
      id: 'd194ef37-8542-4fbf-9465-1e5328991f42',
      userId: 'c341231b-7aa0-47a1-ad23-636cbd959442', // Emma Doe
      type: UserTokenType.email_change,
      tokenHash: hashUserToken(EMAIL_CHANGE_TOKENS.expired),
      newEmail: 'emma.new@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2025-01-02T00:00:00.000Z'),
      consumedAt: null,
    },
    {
      id: '79331bb7-69c6-427e-9a61-9284db3a2340',
      userId: '3e6903a8-f4ab-484a-98f6-c3b45d6c64bb', // Diana Doe
      type: UserTokenType.email_change,
      tokenHash: hashUserToken(EMAIL_CHANGE_TOKENS.consumed),
      newEmail: 'diana.new@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2036-01-01T00:00:00.000Z'),
      consumedAt: new Date('2025-01-01T00:05:00.000Z'),
    },
    {
      id: 'b545ddd2-6f98-4b82-8e4a-e5f1d4e79d05',
      userId: '49731efd-2d37-4fcc-8221-8575cba5b722', // Claudia Doe
      type: UserTokenType.email_change,
      tokenHash: hashUserToken(EMAIL_CHANGE_TOKENS.collision),
      newEmail: 'cabin-crew@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2036-01-01T00:00:00.000Z'),
      consumedAt: null,
    },
    {
      id: '387cb3ae-af25-4476-b753-dd13fa25aefb',
      userId: '381334df-1e3c-41f5-8513-0e2de3c1662f', // Abby Doe
      type: UserTokenType.password_reset,
      tokenHash: hashUserToken(PASSWORD_RESET_TOKENS.valid),
      newEmail: null,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2036-01-01T00:00:00.000Z'),
      consumedAt: null,
    },
    {
      id: 'bd542915-19b9-457c-8bfd-b26bfee58087',
      userId: '725f5df2-0c78-4fe8-89a2-52566c89cf7f', // Alan Doe
      type: UserTokenType.password_reset,
      tokenHash: hashUserToken(PASSWORD_RESET_TOKENS.expired),
      newEmail: null,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2025-01-01T01:00:00.000Z'),
      consumedAt: null,
    },
    {
      id: 'c6ef1514-0628-4c56-b314-3ed447af4812',
      userId: '629be07f-5e65-429a-9d69-d34b99185f50', // Michael Doe
      type: UserTokenType.password_reset,
      tokenHash: hashUserToken(PASSWORD_RESET_TOKENS.consumed),
      newEmail: null,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2036-01-01T00:00:00.000Z'),
      consumedAt: new Date('2025-01-01T00:05:00.000Z'),
    },
  ];

  await tx.userToken.createMany({ data: tokens });
}
