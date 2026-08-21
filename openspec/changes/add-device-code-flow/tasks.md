<!--
Each group is an independent, individually shippable unit (one GitHub issue). Every
group carries its own schema/migration/client-regen work; there is no shared
"foundations" group. Dependencies between groups are noted in each heading. Group 7 is
the Definition of Done applied inside every group, not a separate issue.

Ordering constraint worth stating once: group 6 must not ship before groups 1 and 3.
A device flow released ahead of them mints 60-day full-authority tokens that later
scoping cannot retroactively narrow.
-->

## 1. Per-client session lifetime (independent, behaviour-preserving)

- [ ] 1.1 Thread a token lifetime through `SessionService.open()` / `renew()` into `SessionRepository.create()` / `update()`, replacing the hardcoded `'7d'` at `session.service.ts:11` and both `7 * 24 * 60 * 60 * 1000` literals at `session.repository.ts:16` and `:26`; default to the current 7 days so behaviour is unchanged
- [ ] 1.2 Derive the row's `expiresAt` from the same lifetime value that produces the JWT `exp`, so the two can never disagree
- [ ] 1.3 Colocated Jest spec: a 7-day and a 60-day lifetime each produce a matching JWT `exp` and stored `expiresAt`
- [ ] 1.4 Cucumber: existing auth suites (`sign-in`, `refresh`, `sign-out`, Google, Discord) stay green — this group adds no endpoint

## 2. Session identity, listing and revocation (independent) — capability `user-session-management`

- [ ] 2.1 Add `clientName String?`, `deviceLabel String?`, `ipAddress String?`, `lastUsedAt DateTime?` to `JwtRefreshToken` in `schema.prisma`; migrate; regenerate the client to `prisma/client/`
- [ ] 2.2 Add a client-context parameter to `SessionService.open()` and thread `@Req()` through `SignInAction`, `GoogleSignInAction` and `DiscordSignInAction` into `SignInCommand`, `SignInWithGoogleCommand` and `SignInWithDiscordCommand` so web sessions carry a client name, a device label derived from the User-Agent, and the originating IP
- [ ] 2.3 Update `lastUsedAt` and `ipAddress` in `SessionService.renew()`
- [ ] 2.4 `list-own-sessions.query` + `GET /api/v1/user/me/sessions` returning id, client name, device label, IP, created, last used, expiry and an `isCurrent` flag; assert no token or token hash appears in the response DTO
- [ ] 2.5 `revoke-session.command` + `DELETE /api/v1/user/me/sessions/:id` (`UuidParam`), scoped to the caller's own sessions; reject revoking the acting session with a typed error pointing at sign-out; answer a session owned by somebody else as not found
- [ ] 2.6 New typed errors under `src/modules/auth/model/error/` for "cannot revoke the acting session" and "session not found"; register every new handler in `providers` and every action in `controllers`
- [ ] 2.7 Seed: sessions with fixed v4 UUIDs on a seeded user — one web, one device-labelled, one belonging to a different user — so the listing and both refusals are assertable without driving sign-ins
- [ ] 2.8 Cucumber `features/auth/session.list.feature` and `session.revoke.feature`, one file per endpoint, full-body assertions, each covering admin / cabin-crew / unauthorized

## 3. Access token scopes (independent) — capability `access-token-scopes`

- [ ] 3.1 Add `scopes String[]` to `JwtRefreshToken` in `schema.prisma`; migrate; regenerate the client
- [ ] 3.2 Add `scopes?: string[]` to `JwtUser`; include it in the payload built by `SessionService.issueTokens()` only when the session has scopes
- [ ] 3.3 Persist scopes on session creation and **read them back from the row in `renew()`** so a refresh cannot widen a session — this is the escalation trap in design.md § Decision 6
- [ ] 3.4 `@Scope()` decorator and `ScopesGuard` in `src/core/http/auth/`, registered as an `APP_GUARD` after `RolesGuard`: pass through when the token declares no scopes, default-deny when it does, refuse with a typed `ForbiddenError`
- [ ] 3.5 Exempt `/api/v1/auth/refresh` and `/api/v1/auth/sign-out` so any session can maintain and end itself
- [ ] 3.6 Colocated Jest spec for `ScopesGuard`: unscoped token on an unannotated route allows; scoped token on a matching route allows; scoped token on a mismatched route forbids; scoped token on an unannotated route forbids
- [ ] 3.7 Cucumber: an unscoped session reaches every endpoint it reaches today (regression guard for the pass-through rule)

## 4. Transponder context read (needs 3) — capability `transponder-context`

- [ ] 4.1 `get-transponder-context.query` in `users`, composing pilot name, current flight (callsign, departure, arrival, registration, aircraft type) and Discord presence from queries already on the bus — no direct `PrismaService`, no flight repository read from `users`
- [ ] 4.2 `GET /api/v1/user/me/transponder` with `@Scope('transponder')`, tag `user`, no cache interceptor (design.md § Decision 10); flight and presence nullable, absent rather than erroring
- [ ] 4.3 Response DTO carrying nothing beyond the listed fields — no email, linked identifier, SimBrief id, licence, home airport or notification preference
- [ ] 4.4 Cucumber `features/user/user.transponder-context.feature`: pilot on a flight (full body); pilot with no current flight; rich presence disabled; admin / cabin-crew / unauthorized

## 5. Device-link notification (independent) — capability `device-code-flow`

- [ ] 5.1 Transactional email template for a device link, naming client and device label and carrying a revoke link, following `docs/EMAILS.md`
- [ ] 5.2 Domain event on approval plus an `@OnEvent` listener that sends the email, and a Discord DM when the account is linked; emit with `emitAsync` if any feature reads the side effect immediately
- [ ] 5.3 Cucumber: approving a device produces the notification; a denied device produces none

## 6. Device code flow (needs 1, 3; notification from 5) — capability `device-code-flow`

- [ ] 6.1 Add `device_authorization` table and `DeviceAuthorizationStatus` enum (`pending`, `approved`, `denied`, `consumed`) to `schema.prisma`; migrate; regenerate the client
- [ ] 6.2 `DeviceAuthorizationRepository` under `auth/infra/database/repository/` — the only place `PrismaService` is touched for this table
- [ ] 6.3 User-code generator: 8 characters, 19-consonant alphabet excluding `L`, formatted `XXXX-XXXX`; matching is case-insensitive and separator-insensitive. Colocated Jest spec for the alphabet, the format and the normalisation
- [ ] 6.4 Device-code generator: 32 CSPRNG bytes, base64url, stored as SHA-256 — deterministic because the poll looks the row up by it (design.md § Decision 3)
- [ ] 6.5 `request-device-code.command` + `POST /api/v1/auth/device/code`, `@SkipAuth()`, capturing client name, device label and originating IP, returning device code, user code, verification URL, pre-filled verification URL, interval and expiry
- [ ] 6.6 `get-device-authorization.query` + `GET /api/v1/auth/device/:userCode`, JWT-guarded, returning client name, device label, IP and request time
- [ ] 6.7 `approve-device-authorization.command` and `deny-device-authorization.command` + `POST /api/v1/auth/device/:userCode/approve` and `/deny`, JWT-guarded, transitioning from `pending` only
- [ ] 6.8 `poll-device-token.command` + `POST /api/v1/auth/device/token`, `@SkipAuth()`, answering `200` with a status envelope (`authorization_pending` / `slow_down` / `access_denied` / `expired_token` / `approved`) per design.md § Decision 2; `401` for an unrecognised device code
- [ ] 6.9 On the first approved poll: issue the session through `SessionService.open()` with the 60-day lifetime and the `transponder` scope, then mark the row `consumed` so a replay reports `expired_token`
- [ ] 6.10 Derive expiry from `expiresAt` at read time in every path — poll, review, approve, deny — with no dependence on the scheduler
- [ ] 6.11 Enforce the poll interval from `lastPolledAt`, answering `slow_down` with a longer interval without invalidating the authorization
- [ ] 6.12 Typed errors under `auth/model/error/`; all five actions under the Swagger tag `auth - device code flow`; register every handler in `providers` and every action in `controllers`
- [ ] 6.13 Seed `device_authorization` rows with fixed v4 UUIDs in each state — pending, approved, denied, consumed, past-expiry — storing the SHA-256 of known plaintext device codes so scenarios assert against fixtures rather than driving the flow end to end
- [ ] 6.14 Cucumber under `features/auth/`, one file per endpoint: `device.request-code`, `device.get-authorization`, `device.approve`, `device.deny`, `device.poll`. Cover the full happy path, one-shot consumption, expiry, `slow_down`, deciding an already-decided authorization, an unknown user code, an unknown device code, and admin / cabin-crew / unauthorized on the three guarded endpoints
- [ ] 6.15 Cucumber: a session obtained through a device authorization is refused on an unannotated endpoint, and is **still** refused after a refresh (the escalation guard)

## 7. Definition of Done (applied inside every group above)

- [ ] 7.1 `docker compose exec app npm run lint` + `format:fix` + `build` pass (revert the three unrelated `.feature` files Prettier churns)
- [ ] 7.2 `docker compose exec app npx jest --runInBand` passes (`npm test` OOMs the container)
- [ ] 7.3 The group's Cucumber suite passes, scenarios reconciled statically against the seed and side effects first
- [ ] 7.4 Swagger renders the group's endpoints under the intended tag with no meaningless response descriptions
- [ ] 7.5 `openspec validate add-device-code-flow --strict` stays green

## 8. Companion repositories (tracked here, implemented elsewhere)

- [ ] 8.1 `flight-tracker-app`: `/device` route rendering the consent card — client, device label, IP, request time — behind sign-in with a redirect back, plus the session list panel on `/me/account`. Its own OpenSpec change in that store
- [ ] 8.2 `flight-tracker-transponder-app`: replace `promptForSignIn` with the device flow, open the pre-filled verification URL through the existing command runner, collapse the three per-tick reads onto `/user/me/transponder`, and treat a `401` on refresh as "re-link this device" rather than an error. Its own OpenSpec change in that store
