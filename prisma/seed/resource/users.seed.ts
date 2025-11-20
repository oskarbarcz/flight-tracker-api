import { PrismaClient, User, UserRole } from '@prisma/client';

export async function loadUsers(): Promise<void> {
  const john: User = {
    id: 'e181d983-3b69-4be2-864e-2a7596217ddf',
    name: 'John Doe',
    email: 'admin@example.com',
    role: UserRole.Admin,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    pilotLicenseId: null,
    currentFlightId: null,
    currentRotationId: null,
  };

  const alice: User = {
    id: '721ab705-8608-4386-86b4-2f391a3655a7',
    name: 'Alice Doe',
    email: 'operations@example.com',
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    pilotLicenseId: null,
    currentFlightId: null,
    currentRotationId: null,
  };

  const rick: User = {
    id: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
    name: 'Rick Doe',
    email: 'cabin-crew@example.com',
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    // null because seed flights loaded later than seed users
    // AAL 4908 attached in flights.seed.ts
    currentFlightId: null,
    currentRotationId: null,
    pilotLicenseId: 'UK-31270',
  };

  const alan: User = {
    id: '725f5df2-0c78-4fe8-89a2-52566c89cf7f',
    name: 'Alan Doe',
    email: 'alan.doe@example.com',
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    // null because seed flights loaded later than seed users
    // DLH 42 attached in flights.seed.ts
    currentFlightId: null,
    // null because seed flights loaded later than seed users
    // 02-2025 attached in rotations.seed.ts
    currentRotationId: null,
    pilotLicenseId: 'UK-34560',
  };

  const michael: User = {
    id: '629be07f-5e65-429a-9d69-d34b99185f50',
    name: 'Michael Doe',
    email: 'michael.doe@example.com',
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    // null because seed flights loaded later than seed users
    // DLH 43 attached in flights.seed.ts
    currentFlightId: null,
    // null because seed flights loaded later than seed users
    // 03-2025 attached in rotations.seed.ts
    currentRotationId: null,
    pilotLicenseId: 'UK-98540',
  };

  const prisma = new PrismaClient();
  for (const user of [john, alice, rick, alan, michael]) {
    await prisma.user.create({ data: user });
  }
}
