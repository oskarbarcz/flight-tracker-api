import { Prisma } from '../../client/client';

export const SEEDED_OPERATIONS_SESSION_ID =
  '64a5ef90-399a-4ce5-8ee3-41c6707d0e68';

export const SEEDED_ADMIN_SESSION_ID = 'de1f7240-5a37-4e64-a77e-401177bbe5ae';

export const SEEDED_GOOGLE_ONLY_SESSION_ID =
  'c98cdeae-7945-4b22-afbb-25ff931fcd7a';

export async function loadSessions(
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.jwtRefreshToken.create({
    data: {
      id: SEEDED_OPERATIONS_SESSION_ID,
      userId: '721ab705-8608-4386-86b4-2f391a3655a7',
      // bcrypt hash of the long-lived ES256 refresh token hardcoded in
      // features/user/user.me.change-password.feature, signed with JWT_PRIVATE_KEY
      token: '$2b$12$/n372CwB6/priXihn8lqa.jljdzqwyIawLQdHNSc6KB8L2wsBZ/0K',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2036-01-01T00:00:00.000Z'),
    },
  });

  await tx.jwtRefreshToken.create({
    data: {
      id: SEEDED_ADMIN_SESSION_ID,
      userId: 'e181d983-3b69-4be2-864e-2a7596217ddf',
      // bcrypt hash of the long-lived ES256 refresh token hardcoded in
      // features/user/user.unlink-google-account.feature, signed with JWT_PRIVATE_KEY
      token: '$2b$12$zrvjvaxLqpjfoWfL2Nf/EOAQpGvkMOnEQ6v8tWvZ34TRGgWSeTmu2',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2036-01-01T00:00:00.000Z'),
    },
  });

  await tx.jwtRefreshToken.create({
    data: {
      id: SEEDED_GOOGLE_ONLY_SESSION_ID,
      userId: '59bd52f0-6523-4a04-b1f7-96098db05fd0',
      // bcrypt hash of the long-lived ES256 refresh token hardcoded in
      // features/user/user.set-password.feature, signed with JWT_PRIVATE_KEY
      token: '$2b$12$62wbUjoFdkTYPhi3eujUOO23rlQECTku55AuIjRDsjMpBwFtVFaj6',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      expiresAt: new Date('2036-01-01T00:00:00.000Z'),
    },
  });
}
