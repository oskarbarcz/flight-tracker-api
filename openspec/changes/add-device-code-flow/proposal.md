## Why

The Windows transponder app signs in by prompting for an email and a password in a
terminal. Two things are wrong with that. `User.password` is nullable, so **anyone who
signed up through Google or Discord cannot use the companion app at all** — there is no
credential for them to type. And the app is an unsigned single-file `.exe` from GitHub
Releases asking for account credentials, which is exactly the shape of a credential
stealer; users are right to distrust it.

This change replaces terminal credentials with a **device code flow**: the app shows a
short code, the user approves the device in the browser using whatever sign-in method
they already have, and the app receives a session. Because approval happens on the web,
the `.exe` never learns what an OAuth provider is, and Google-only and Discord-only
users are unblocked without a line of provider code shipping to the desktop.

## What Changes

- **Device code flow.** The app requests a device code, shows the user an 8-character
  code and a verification URL, and polls until the user approves or denies. Approval is
  a signed-in action on the web app. The approval is one-shot: the first successful poll
  consumes it and no second token pair is ever issued for the same code.
- **Scoped access tokens.** The JWT gains an optional `scopes` claim, enforced by a new
  `ScopesGuard`. A token carrying scopes may only reach endpoints that declare a
  matching `@Scope()`; a token with no scopes claim is unaffected, so every existing
  session and endpoint keeps working untouched. Device sessions are issued with the
  single scope `transponder`. Scopes are persisted on the session row and carried
  through refresh, so a refresh cannot silently widen a device session's privileges.
- **A dedicated transponder read surface.** New `GET /api/v1/user/me/transponder`
  returning only what the companion app needs — pilot name, the current flight's
  callsign/route/aircraft, and the Discord presence payload. It replaces three separate
  reads (`/user/me`, `/flight/:id`, `/user/me/discord-presence`), and because it takes
  no flight id, "the caller's current flight" is true by construction rather than by a
  contextual authorization check.
- **Named, listable, revocable sessions.** Session rows gain a client name, device
  label, IP address and last-used timestamp, populated for web sign-ins as well as
  device links. Users can list every open session and revoke any one of them except the
  one making the request.
- **Per-client refresh token lifetime.** Device sessions get a 60-day refresh token; web
  sessions keep 7 days. The lifetime currently sits hardcoded in three places that must
  agree, and becomes a parameter threaded from `SessionService` into `SessionRepository`.
- **Out-of-band notification on device link.** Linking a device sends an email — and a
  Discord DM when the account is linked — naming the device and offering a revoke link.
  This is the only real defence against device-code phishing, where an attacker starts a
  flow and talks the victim into approving it.

No breaking changes. Every addition is opt-in: unscoped tokens behave as they do today,
and the existing `/api/v1/auth/sign-in` password flow is untouched.

## Capabilities

### New Capabilities

- `device-code-flow`: requesting a device code, the browser-side approval and denial of
  a pending device, polling for the resulting session, and the expiry and single-use
  rules that bound it.
- `access-token-scopes`: the optional `scopes` claim, default-deny enforcement for
  scoped tokens, pass-through for unscoped ones, and the requirement that scopes survive
  a refresh unchanged.
- `user-session-management`: session identity attributes, listing a user's open
  sessions, and revoking a named session.
- `transponder-context`: the single read projection the companion app uses in place of
  three general-purpose endpoints.

### Modified Capabilities

- _None._ All changes are additive. `user-password-change` already requires that a
  password change revokes every other session belonging to the user, which covers device
  sessions without rewording.

## Impact

- **`auth` module:** new `device/` sub-namespace (command / query / model / infra-http)
  holding the five device-flow actions under the Swagger tag
  `auth - device code flow`; new `DeviceAuthorizationRepository`; `SessionService.open()`
  and `renew()` take a client context and a token lifetime; `SessionRepository.create()`
  and `update()` take a lifetime instead of hardcoding seven days twice. The three
  existing `sessionService.open()` call sites (`sign-in`, `sign-in-with-google`,
  `sign-in-with-discord`) and their actions must thread the request's User-Agent and IP
  so web sessions are labelled too.
- **`users` module:** `GET /api/v1/user/me/transponder`; `GET` and `DELETE
  /api/v1/user/me/sessions[/:id]`.
- **`core`:** `JwtUser` gains `scopes?: string[]`; new `@Scope()` decorator and
  `ScopesGuard` registered as an `APP_GUARD` beside `RolesGuard`. `JwtTokenGuard` is
  unchanged.
- **Prisma schema:** new table `device_authorization` and enum
  `DeviceAuthorizationStatus`; `JwtRefreshToken` gains `clientName`, `deviceLabel`,
  `ipAddress`, `lastUsedAt` and `scopes`. Client emits to `prisma/client/` — imports
  remain `from 'prisma/client/client'`.
- **Email:** one new transactional template for the device-link notice, following
  `docs/EMAILS.md`.
- **Scheduling:** device authorization expiry is derived from `expiresAt` at read time
  and never depends on a scheduler; an optional garbage-collection cron only deletes
  stale rows.
- **Functional tests:** new `features/auth/` Gherkin per endpoint, seed-fixture driven.
- **Companion repositories (not in this change):** the `/device` approval route in
  `flight-tracker-app`, and replacing `promptForSignIn` in
  `flight-tracker-transponder-app`. Each needs its own change in its own store; this
  proposal is the API contract they build against.
- **Explicitly out of scope:** moving position publishing off the shared
  `ADSB_CLIENT_TOKEN`. That token is compiled into a public release binary and
  `adsb-receiver-api` has no per-user concept, which is a real problem — but it is a
  different service in a different repository and unrelated to device login.
