import { Prisma, User, UserRole } from '../../client/client';

export async function loadUsers(tx: Prisma.TransactionClient): Promise<void> {
  const john: User = {
    id: 'e181d983-3b69-4be2-864e-2a7596217ddf',
    name: 'John Doe',
    email: 'admin@example.com',
    role: UserRole.Admin,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: null,
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
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
    simbriefUserId: null,
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
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
    simbriefUserId: '123456',
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
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
    simbriefUserId: '654321',
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
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
    pilotLicenseId: 'UK-31270',
    simbriefUserId: null,
    homeAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportUpdatedAt: null,
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
    pilotLicenseId: 'UK-34560',
    simbriefUserId: null,
    homeAirportId: 'f35c094a-bec5-4803-be32-bd80a14b441a', // EDDF
    lastAirportId: 'f35c094a-bec5-4803-be32-bd80a14b441a', // EDDF
    lastAirportUpdatedAt: null,
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
    pilotLicenseId: 'UK-98540',
    simbriefUserId: null,
    homeAirportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046', // EPWA
    lastAirportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046', // EPWA
    lastAirportUpdatedAt: null,
  };

  const diana: User = {
    id: '3e6903a8-f4ab-484a-98f6-c3b45d6c64bb',
    name: 'Diana Doe',
    email: 'diana.doe@example.com',
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: '111222',
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
  };

  const emma: User = {
    id: 'c341231b-7aa0-47a1-ad23-636cbd959442',
    name: 'Emma Doe',
    email: 'emma.doe@example.com',
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: '333444',
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
  };

  for (const user of [
    john,
    alice,
    claudia,
    abby,
    rick,
    alan,
    michael,
    diana,
    emma,
  ]) {
    await tx.user.create({ data: user });
  }
}
