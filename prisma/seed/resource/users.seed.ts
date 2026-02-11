import { User, UserRole } from '../../client/client';
import { PrismaService } from '../../../src/core/provider/prisma/prisma.service';

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
    simbriefUserId: null,
    totalFlightTime: 0,
    totalGreatCircleDistance: 0,
    totalFuelBurned: 0,
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
    simbriefUserId: null,
    totalFlightTime: 0,
    totalGreatCircleDistance: 0,
    totalFuelBurned: 0,
  };

  const abby: User = {
    id: '381334df-1e3c-41f5-8513-0e2de3c1662f',
    name: 'Abby Doe',
    email: 'abby.doe@example.com',
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    pilotLicenseId: null,
    currentFlightId: null,
    currentRotationId: null,
    simbriefUserId: '123456',
    totalFlightTime: 0,
    totalGreatCircleDistance: 0,
    totalFuelBurned: 0,
  };

  const claudia: User = {
    id: '49731efd-2d37-4fcc-8221-8575cba5b722',
    name: 'Claudia Doe',
    email: 'claudia.doe@example.com',
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    pilotLicenseId: null,
    currentFlightId: null,
    currentRotationId: null,
    simbriefUserId: '654321',
    totalFlightTime: 0,
    totalGreatCircleDistance: 0,
    totalFuelBurned: 0,
  };

  const rick: User = {
    id: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
    name: 'Rick Doe',
    email: 'cabin-crew@example.com',
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    // null because seed flights loaded later than seed users
    // AAL4908 attached in flights.seed.ts
    currentFlightId: null,
    currentRotationId: null,
    pilotLicenseId: 'UK-31270',
    simbriefUserId: null,
    totalFlightTime: 1797,
    totalGreatCircleDistance: 7850,
    totalFuelBurned: 326000,
  };

  const alan: User = {
    id: '725f5df2-0c78-4fe8-89a2-52566c89cf7f',
    name: 'Alan Doe',
    email: 'alan.doe@example.com',
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    // null because seed flights loaded later than seed users
    // DLH42 attached in flights.seed.ts
    currentFlightId: null,
    // null because seed flights loaded later than seed users
    // 02-2025 attached in rotations.seed.ts
    currentRotationId: null,
    pilotLicenseId: 'UK-34560',
    simbriefUserId: null,
    totalFlightTime: 0,
    totalGreatCircleDistance: 0,
    totalFuelBurned: 0,
  };

  const michael: User = {
    id: '629be07f-5e65-429a-9d69-d34b99185f50',
    name: 'Michael Doe',
    email: 'michael.doe@example.com',
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    // null because seed flights loaded later than seed users
    // DLH43 attached in flights.seed.ts
    currentFlightId: null,
    // null because seed flights loaded later than seed users
    // 03-2025 attached in rotations.seed.ts
    currentRotationId: null,
    pilotLicenseId: 'UK-98540',
    simbriefUserId: null,
    totalFlightTime: 0,
    totalGreatCircleDistance: 0,
    totalFuelBurned: 0,
  };

  const prisma = new PrismaService();
  for (const user of [john, alice, claudia, abby, rick, alan, michael]) {
    await prisma.user.create({ data: user });
  }
}
