import { Prisma, User, UserRole } from '../../client/client';
import { WeatherSource } from '../../../src/modules/airports/model/airport-weather.model';

// Addresses seeded as pre-existing data are confirmed, matching the backfill
// the email-confirmation migration applies to rows that predate it.
const CONFIRMED_AT = new Date('2025-01-01T00:00:00.000Z');

export const USER_IDS = {
  john: 'e181d983-3b69-4be2-864e-2a7596217ddf',
  alice: '721ab705-8608-4386-86b4-2f391a3655a7',
  abby: '381334df-1e3c-41f5-8513-0e2de3c1662f',
  claudia: '49731efd-2d37-4fcc-8221-8575cba5b722',
  rick: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
  alan: '725f5df2-0c78-4fe8-89a2-52566c89cf7f',
  michael: '629be07f-5e65-429a-9d69-d34b99185f50',
  diana: '3e6903a8-f4ab-484a-98f6-c3b45d6c64bb',
  emma: 'c341231b-7aa0-47a1-ad23-636cbd959442',
  grace: '59bd52f0-6523-4a04-b1f7-96098db05fd0',
} as const;

export async function loadUsers(tx: Prisma.TransactionClient): Promise<void> {
  const john: User = {
    id: USER_IDS.john,
    name: 'John Doe',
    email: 'admin@example.com',
    emailConfirmedAt: CONFIRMED_AT,
    role: UserRole.Admin,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    googleId: '104778392015664201883',
    googleEmail: null,
    discordId: null,
    discordUsername: null,
    discordGlobalName: null,
    discordAvatar: null,
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: null,
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.AviationWeatherGov,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
  };

  const alice: User = {
    id: USER_IDS.alice,
    name: 'Alice Doe',
    email: 'operations@example.com',
    emailConfirmedAt: CONFIRMED_AT,
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    googleId: null,
    googleEmail: null,
    discordId: null,
    discordUsername: null,
    discordGlobalName: null,
    discordAvatar: null,
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: null,
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.SayIntentions,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
  };

  const abby: User = {
    id: USER_IDS.abby,
    name: 'Abby Doe',
    email: 'abby.doe@example.com',
    emailConfirmedAt: CONFIRMED_AT,
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    googleId: null,
    googleEmail: null,
    discordId: null,
    discordUsername: null,
    discordGlobalName: null,
    discordAvatar: null,
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: '123456',
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.AviationWeatherGov,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
  };

  const claudia: User = {
    id: USER_IDS.claudia,
    name: 'Claudia Doe',
    email: 'claudia.doe@example.com',
    emailConfirmedAt: CONFIRMED_AT,
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    googleId: null,
    googleEmail: null,
    discordId: null,
    discordUsername: null,
    discordGlobalName: null,
    discordAvatar: null,
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: '654321',
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.AviationWeatherGov,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
  };

  const rick: User = {
    id: USER_IDS.rick,
    name: 'Rick Doe',
    email: 'cabin-crew@example.com',
    emailConfirmedAt: CONFIRMED_AT,
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    googleId: null,
    googleEmail: null,
    discordId: '100000000000000300',
    discordUsername: 'rick.doe',
    discordGlobalName: 'Rick Doe',
    discordAvatar: 'c4d5e6f70819202a3b4c5d6e7f809a1b',
    // null because seed flights loaded later than seed users
    // AAL4908 attached in flights.seed.ts
    currentFlightId: null,
    pilotLicenseId: 'UK-31270',
    simbriefUserId: null,
    homeAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportId: '3c721cc6-c653-4fad-be43-dc9d6a149383', // KJFK
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.AviationWeatherGov,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
  };

  const alan: User = {
    id: USER_IDS.alan,
    name: 'Alan Doe',
    email: 'alan.doe@example.com',
    emailConfirmedAt: CONFIRMED_AT,
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    googleId: null,
    googleEmail: null,
    discordId: null,
    discordUsername: null,
    discordGlobalName: null,
    discordAvatar: null,
    // null because seed flights loaded later than seed users
    // DLH42 attached in flights.seed.ts
    currentFlightId: null,
    // null because seed flights loaded later than seed users
    pilotLicenseId: 'UK-34560',
    simbriefUserId: null,
    homeAirportId: 'f35c094a-bec5-4803-be32-bd80a14b441a', // EDDF
    lastAirportId: 'f35c094a-bec5-4803-be32-bd80a14b441a', // EDDF
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.AviationWeatherGov,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
  };

  const michael: User = {
    id: USER_IDS.michael,
    name: 'Michael Doe',
    email: 'michael.doe@example.com',
    emailConfirmedAt: CONFIRMED_AT,
    role: UserRole.CabinCrew,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    googleId: null,
    googleEmail: null,
    discordId: '100000000000000100',
    discordUsername: 'michael.doe',
    discordGlobalName: 'Michael Doe',
    discordAvatar: 'b1c2d3e4f5061728394a5b6c7d8e9f00',
    // null because seed flights loaded later than seed users
    // DLH43 attached in flights.seed.ts
    currentFlightId: null,
    // null because seed flights loaded later than seed users
    pilotLicenseId: 'UK-98540',
    simbriefUserId: null,
    homeAirportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046', // EPWA
    lastAirportId: '616cbdd7-ccfc-4687-8cf6-1e7236435046', // EPWA
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.AviationWeatherGov,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
  };

  const diana: User = {
    id: USER_IDS.diana,
    name: 'Diana Doe',
    email: 'diana.doe@example.com',
    emailConfirmedAt: CONFIRMED_AT,
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    googleId: null,
    googleEmail: null,
    discordId: null,
    discordUsername: null,
    discordGlobalName: null,
    discordAvatar: null,
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: '111222',
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.AviationWeatherGov,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
  };

  // Address was never proven — the unconfirmed fixture
  const emma: User = {
    id: USER_IDS.emma,
    name: 'Emma Doe',
    email: 'emma.doe@example.com',
    emailConfirmedAt: null,
    role: UserRole.Operations,
    // password: 'P@$$w0rd' — bcrypt with 12 rounds
    password: '$2a$12$9MvL6NtPLtmU3GSfANn5IuRd64UJNTxWv3ZQE6Cs/AJQFW6zw3S/2',
    googleId: null,
    googleEmail: null,
    discordId: null,
    discordUsername: null,
    discordGlobalName: null,
    discordAvatar: null,
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: '333444',
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.AviationWeatherGov,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
  };

  // Signs in with Google only — no password to verify, reset or change
  const grace: User = {
    id: USER_IDS.grace,
    name: 'Grace Doe',
    email: 'grace.doe@example.com',
    emailConfirmedAt: CONFIRMED_AT,
    role: UserRole.Operations,
    password: null,
    googleId: '117645320198734512096',
    googleEmail: 'grace.doe@gmail.com',
    discordId: '100000000000000200',
    discordUsername: 'grace.doe',
    discordGlobalName: null,
    discordAvatar: null,
    pilotLicenseId: null,
    currentFlightId: null,
    simbriefUserId: null,
    homeAirportId: null,
    lastAirportId: null,
    lastAirportUpdatedAt: null,
    defaultWeatherSource: WeatherSource.AviationWeatherGov,
    discordBriefingsEnabled: true,
    discordPreliminaryLoadsheetEnabled: true,
    discordFinalLoadsheetEnabled: true,
    discordDelayUpdatesEnabled: true,
    discordRichPresenceEnabled: false,
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
    grace,
  ]) {
    await tx.user.create({ data: user });
  }
}
