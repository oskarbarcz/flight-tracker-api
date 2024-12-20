import { PrismaClient, User, UserRole } from '@prisma/client';

export async function loadUsers(prisma: PrismaClient): Promise<void> {
  const john: User = {
    id: 'e181d983-3b69-4be2-864e-2a7596217ddf',
    name: 'John Doe',
    email: 'admin@example.com',
    role: UserRole.Admin,
    // password: 'P@$$w0rd' - bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
  };

  const alice: User = {
    id: '721ab705-8608-4386-86b4-2f391a3655a7',
    name: 'Alice Doe',
    email: 'operations@example.com',
    role: UserRole.Operations,
    // password: 'P@$$w0rd' - bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
  };

  const rick: User = {
    id: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
    name: 'Rick Doe',
    email: 'cabin-crew@example.com',
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' - bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
  };

  for (const user of [john, alice, rick]) {
    await prisma.user.create({ data: user });
  }
}