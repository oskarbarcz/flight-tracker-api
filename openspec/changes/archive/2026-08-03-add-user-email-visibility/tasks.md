## 1. Prisma schema

- [x] 1.1 Add `emailConfirmedAt DateTime?` to `User` in `prisma/schema.prisma`.
- [x] 1.2 Add the column and backfill it in one migration: `ALTER TABLE "user" ADD COLUMN "emailConfirmedAt"`, then `UPDATE "user" SET "emailConfirmedAt" = NOW() WHERE "emailConfirmedAt" IS NULL`. Folded into `20260803120000_add_user_tokens_and_email_confirmation` together with the `user_token` table and its enum, since none of the three had been deployed anywhere.
- [x] 1.3 Apply locally with `prisma db push` and regenerate the client. **Note:** `db push` never executes migration SQL, so the backfill was verified separately — see 8.4.

## 2. Seed data

- [x] 2.1 Set `emailConfirmedAt` on every seeded user to a fixed instant, matching the backfill the migration applies to pre-existing rows.
- [x] 2.2 Leave one seeded user (Emma Doe, `emma.doe@example.com`) with `emailConfirmedAt: null` as the unconfirmed fixture.

## 3. Read model

- [x] 3.1 Add `UserEmailDto` (`email`, `isConfirmed`, `active`) and an `emails: UserEmailDto[]` property to `GetOwnUserDto`, leaving the existing `email` field and both administrative read models (`GetUserDto`, the user list) untouched.
- [x] 3.2 Add the internal `OwnUserRecord` type (own-user fields plus `emailConfirmedAt`) so the repository can return the timestamp without it reaching the response.
- [x] 3.3 Have `UsersRepository.findOwnById` return `OwnUserRecord`.

## 4. Pending address lookup

- [x] 4.1 Add `UserTokenRepository.findPending(userId, type)` returning the outstanding unconsumed, unexpired token.
- [x] 4.2 Add `GetPendingEmailChangeQuery` + handler in the `auth` module, returning `{ newEmail }` or null, and register it in `auth.module.ts`.

## 5. Composition and cache

- [x] 5.1 Have `GetOwnUserHandler` build `emails` — the active address with `isConfirmed` from `emailConfirmedAt`, plus the pending address as neither active nor confirmed — asking the `auth` module over the query bus.
- [x] 5.2 Add `UsersRepository.setEmail` stamping `emailConfirmedAt` when a change is confirmed.
- [x] 5.3 Add `UserEmailCacheListener` in the `users` module: on `EmailChangeRequestedEvent`, drop the `USER_ME` cache entry so a newly pending address is visible at once. Register it in `users.module.ts`.
- [x] 5.4 Add a colocated `get-own-user.query.spec.ts`: the no-pending case, the pending pair, the unconfirmed active address, the query dispatched to `auth`, and the timestamp staying out of the response.

## 6. Administrative update

- [x] 6.1 Remove `email` from `UpdateUserDto` (`PartialType(OmitType(CreateUserDto, ['email']))`), so the global validation pipe rejects it with `property email should not exist`.
- [x] 6.2 Drop the now-dead "reset confirmation when an administrator changes the address" branch from `UsersRepository.update`.

## 7. HTTP surface

- [x] 7.1 Move the authenticated self-service actions to action-shaped paths under `/api/v1/user/me` with the `user` tag: `POST /change-email`, `POST /change-email/confirm`, `PATCH /change-password`, `POST /link-google-account`. HTTP methods unchanged.
- [x] 7.2 Keep session-less endpoints under `/api/v1/auth`, renaming the reset pair to action shape: `POST /reset-password`, `POST /reset-password/confirm`.
- [x] 7.3 Tag `POST` and `GET /api/v1/user/{id}/travel` as `user travel`.
- [x] 7.4 Strip Swagger operation and response descriptions that restated the summary or the status code, keeping only the non-obvious ones (the reset request's non-enumeration guarantee, and which of two causes a `409` is).
- [x] 7.5 Update the cross-reference in the Google sign-in description to the new link path.

## 8. Tests and verification

- [x] 8.1 Add `emails` to every own-details full-body assertion (`user.me`, `user.me.update`, `user.travel.create`, `user.me.change-email`), with two entries in the pending scenario.
- [x] 8.2 Add scenarios: an unconfirmed active address (Emma Doe), one confirmed address after a completed change, and an administrative update carrying an address rejected with `400` and the address unchanged.
- [x] 8.3 Move the now user-tagged feature files to `features/user/`: `user.me.change-email.feature`, `user.me.change-password.feature`, `user.me.link-google-account.feature`, and fix the two references to their old paths.
- [x] 8.4 Verify the migration chain on a throwaway database: `prisma migrate deploy` from empty, then rewind the column, insert a pre-existing user, replay the migration and confirm the row is backfilled. Also `prisma migrate diff` against the schema — the only reported difference is a pre-existing cosmetic foreign-key diff on `rotation`, untouched by this change.
- [x] 8.5 `npm run lint`, `npm run build`, `npm test` (24 suites / 126 tests) and the full functional suite (904 scenarios / 4247 steps) pass.

## 9. Documentation

- [x] 9.1 Remove the endpoint tables and behaviour prose this sequence had added to `README.md`, leaving only what is needed to run the project: the mail environment variables and the outside-production write to `test-data/mail/`.
- [x] 9.2 Record the behaviour in the specs instead — the address list, confirmation rules, administrative restriction, and the external-identity guarantee.
