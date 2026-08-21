# Design — device code flow

## Context

See `proposal.md` § Why for the motivation. What matters for the approach:

- The companion app is a **console TUI in a single unsigned `.exe`** — no window, no
  embedded browser, no installer. It currently calls `prompt.askSecret('Password: ')`
  and stores the resulting refresh token in DPAPI (Windows) or Keychain (macOS), then
  rides `/api/v1/auth/refresh` indefinitely.
- With the user's JWT it makes **four reads and nothing else**: `/user/me` (name plus
  `currentFlightId`), `/flight/:id` (callsign and route), `/user/me/discord-presence`,
  and an unauthenticated version check. It performs **no writes at all**. Position
  reports go to a different service, `adsb.mypreflight.io`, authenticated with a shared
  `ADSB_CLIENT_TOKEN`.
- `SessionService` mints an access token (15m) and a refresh token (7d) from a
  `GetUserDto`; `SessionRepository` persists a bcrypt hash of the refresh token and an
  `expiresAt`. **The stored hash is never compared** — refresh resolves the session by
  the `session` claim in the signed JWT and updates by id.
- The refresh lifetime is hardcoded in three places that must agree:
  `session.service.ts:11` (the JWT `exp`) and `session.repository.ts:16` and `:26` (the
  row's `expiresAt`).
- Every error body is produced by one global filter as
  `{ statusCode, error, message, violations? }`, where `error` is the HTTP reason
  phrase. There is no per-endpoint control over that shape.
- There is no `@nestjs/throttler` in the project, so there is no general rate limiter to
  lean on.
- `SCHEDULER_ENABLED=false` locally, and scheduled work deadlocks the functional
  suite's database reset — so nothing may depend on a cron for correctness.

## Goals / Non-Goals

**Goals**

- A device obtains a session without the `.exe` ever seeing a credential, and without it
  implementing any identity provider.
- The resulting session is materially less powerful than the account that granted it,
  and stays that way across refreshes.
- A user can see and end any session, including one on a machine they no longer have.

**Non-Goals**

- Wire compatibility with RFC 8628. The flow is shaped by it and borrows its vocabulary,
  but there are no third-party OAuth clients and no reason to pay for compliance. See
  Decision 2.
- A general authorization server — no `/authorize`, no client registry, no redirect URI
  validation, no third-party consent. There is exactly one first-party client.
- Fine-grained scope taxonomy. See Decision 7.
- Moving position publishing onto user tokens. See Risks.

## Decisions

### 1. Device code flow over authorization code + PKCE on a loopback redirect

Both are legitimate for a native desktop app, and PKCE with a `127.0.0.1` redirect is
the more common choice (RFC 8252). Rejected here because:

- PKCE requires building a real authorization endpoint — a page that authenticates,
  renders consent, validates a redirect URI, and mints a single-use code against a
  challenge. That is an authorization server with one client and no third-party
  developers. Device flow needs two unauthenticated endpoints, three authenticated ones,
  and one page in the web app.
- The device flow works when the browser is **not on the same machine**. A flight
  simulator PC is often a dedicated box, sometimes headless, sometimes reached over RDP.
  Loopback redirect assumes browser and app share a machine and a localhost.
- The app today binds no sockets at all. A loopback listener is a new class of thing for
  it to get wrong.

The usual objection to device flow is the clumsy user-code transcription. That is
answered by returning a **pre-filled verification URL** (RFC 8628's
`verification_uri_complete`) which the app opens with the shell, so the code arrives
already entered and the typed code is only the fallback for when the browser is
elsewhere.

### 2. A 200 status envelope on the poll, not RFC 8628 error bodies

RFC 8628 says a pending poll is `400 { "error": "authorization_pending" }`. That body
cannot be produced here: `DomainExceptionFilter` owns the error shape absolutely and
`error` is always the reason phrase, so the machine-readable discriminator would have to
be smuggled into `message` and parsed as a string. Carving an exception into the global
filter for one endpoint is worse.

The poll therefore always answers `200`:

```jsonc
{ "status": "authorization_pending" }
{ "status": "slow_down", "interval": 10 }
{ "status": "access_denied" }
{ "status": "expired_token" }
{ "status": "approved", "accessToken": "…", "refreshToken": "…" }
```

An unrecognised device code is the one real error and stays a `401` through the normal
filter. Keeping the RFC's **vocabulary** means that if third-party clients ever matter,
compliance becomes a response-mapping change rather than a redesign.

**Alternative rejected:** an exception path in the global filter for OAuth-shaped
errors. It would make one endpoint's contract invisible from the filter that supposedly
defines all of them.

### 3. The device code is hashed with SHA-256, not bcrypt

The poll looks the authorization up **by** the device code, so the hash must be
deterministic; bcrypt's per-row salt makes lookup impossible, which is precisely why the
existing session hash is never compared. A device code is 32 bytes from a CSPRNG, so
there is no dictionary to slow down and a fast hash is correct. A device polling every
five seconds through a bcrypt cost-12 comparison would also be gratuitous load.

This is a deliberate divergence from `SessionRepository`'s bcrypt, and the reason is
lookup, not a change of opinion about password hashing.

### 4. Expiry is derived, never scheduled

`expiresAt` is compared at read time. A row past its expiry reports `expired_token` to a
poll and refuses approval, whether or not any background job has run. Correctness cannot
depend on the scheduler, which is disabled locally and deadlocks the functional suite's
reset.

A garbage-collection cron that deletes rows past expiry is optional and purely
housekeeping — the system is correct with it switched off.

### 5. Scopes: pass-through when absent, default-deny when present

`JwtUser` gains `scopes?: string[]`. A new `ScopesGuard` registered as an `APP_GUARD`
beside `RolesGuard`:

```
payload.scopes === undefined  →  allow            (every session in existence today)
payload.scopes present        →  the handler must declare @Scope(x) with x ∈ scopes
                                 no @Scope() declared  →  403
```

The consequence worth stating plainly: **only the three or four endpoints a device may
reach get annotated. The other ~100 are not touched.** Authority is granted by naming an
endpoint, never withheld by remembering to. And because absence of the claim means
unrestricted, every refresh token already in the wild keeps working.

**Alternative rejected:** allow-by-default with an explicit deny list. One forgotten
annotation on a new endpoint would silently hand it to every device.

### 6. Scopes are persisted on the session row and re-read at refresh

`SessionService.renew()` currently rebuilds the payload from a `GetUserDto` and a
session id. Left alone, **the first refresh would strip the scopes claim and hand the
device a full-authority token fifteen minutes after linking.** A scoped session must
therefore store its scopes on `jwt_refresh_token` and `renew()` must read them from
there.

Reading from the row rather than copying the claim out of the presented refresh token —
which is signed, and so would also be safe — additionally lets the session listing show
what a device is allowed to do, and leaves room to narrow a live session later.

### 7. One scope name, a list-shaped mechanism

The device's whole surface is one read plus refresh plus sign-out. Four scope names
(`identity:read`, `flight:read:current`, `presence:read`, `position:write`) that would
only ever be issued as a single bundle model flexibility with no consumer — and two of
them cannot be honestly enforced as annotations at all, which is what motivated
Decision 8. Ship `transponder` alone; the claim and the guard are list-shaped, so a
second scope (the README's flight-document printing is the plausible next one) is a data
change, not a redesign.

### 8. A dedicated transponder read, not scope labels on general-purpose endpoints

`GetOwnUserDto extends OmitType(User, ['password'])` plus `emails[]` plus `identities`.
Annotating `/user/me` with a scope called `identity:read` would be a false label: the
device would still read every email address on the account, the linked Google address,
the Discord user id and avatar, the SimBrief id, the licence number, the home airport
and every notification preference. The scope would limit the **route**, not the **data**.

`/flight/:id` is worse. Restricting it to "the caller's current flight" is a contextual
check — the guard would have to load the user and compare, from a guard, across modules
— and `currentFlightId` cannot be baked into a token that lives sixty days because it
changes every flight. In practice `flight:read:current` degrades to `flight:read:any`.

So `GET /api/v1/user/me/transponder` returns a projection:

```jsonc
{
  "pilot":  { "name": "…" },
  "flight": { "callsign": "…", "departure": "…", "arrival": "…",
              "registration": "…", "type": "…" } | null,
  "presence": { … } | null
}
```

"Current" is true by construction because there is no identifier to pass. The response
carries nothing the dashboard does not display. And it collapses the app's three polls
per tick into one.

**Alternative rejected:** trimming `/user/me`'s response when the token is scoped. One
route returning two shapes breaks the Swagger contract, doubles the tests, and hides the
privilege boundary inside a DTO mapper.

**Cost accepted:** a projection that duplicates fields owned elsewhere can drift. It is
composed from queries already on the bus rather than from fresh repository reads, which
keeps the drift surface to field selection.

### 9. This lives in the `auth` module, not a new one

The usual rule here is that a new table plus logic plus endpoints earns its own module.
This is the exception: device authorization is a **sign-in method**, and the other
sign-in methods (`sign-in-with-google`, `sign-in-with-discord`) already live in `auth`
next to `SessionService`, which approval must call to mint the session. A separate
module would dispatch a command over the bus into `auth` for the only thing it does.

It gets a `device/` sub-namespace inside the module rather than a flat sprawl across
`application/command`.

The session listing and the transponder read are the exception to the exception: both
hang off `/api/v1/user/me` and belong in `users`, reading through the bus.

### 10. The transponder read is not cached

`/user/me` sits behind `UserAwareCacheInterceptor`. The transponder read deliberately
does not, for now: it is polled by a client that must see a flight phase change
promptly, and cached reads in this codebase have a history of surviving database resets
and confusing the functional suite. If polling load ever justifies it, a short
user-aware TTL is the answer, not a long one.

### 11. Concrete parameters

| Parameter | Value | Rationale |
|---|---|---|
| User code | 8 chars, `XXXX-XXXX` | ~34 bits, well above RFC 8628's 20-bit floor |
| User code alphabet | 19 consonants, no `L` | no vowels means no code spells a word; `L`/`I`/`1` and `O`/`0` excluded as confusable |
| Device code | 32 bytes, base64url | stored as SHA-256 |
| Authorization lifetime | 10 minutes | bounds the window for a code obtained by deception |
| Poll interval | 5s, `slow_down` adds 5s | the only polling limit available without a throttler |
| Device refresh lifetime | 60 days | a pilot flying fortnightly must not be signed out between flights |
| Web refresh lifetime | 7 days | unchanged |

## Risks / Trade-offs

**Device-code phishing** → The structural weakness of this flow, and the one that hit
Microsoft 365 through 2024–25: an attacker starts the flow on their own machine and
persuades the victim to approve the code. Nothing in the protocol distinguishes that
from a legitimate approval, because the victim really did approve. Mitigated by, in
order of value: an out-of-band notification on every link, carrying a revoke link; a
consent screen that leads with *"only continue if you just started this yourself"* and
shows client, device label and originating IP; a 10-minute window; and the fact that
legitimate users arrive by pre-filled URL, so a hand-typed code is already faintly
unusual. Accepted as residual — it is the cost of the flow.

**Silent privilege escalation on refresh** → Decision 6. Called out separately here
because it fails open, invisibly, fifteen minutes after a device links, and no functional
test would notice unless one is written for it specifically. `access-token-scopes` has a
scenario for exactly this.

**A password change unlinks the device with no explanation** → `change-password` and
`set-password` already dispatch `SignOutOtherSessionsCommand`; password reset and email
change dispatch `SignOutEverywhereCommand`. That behaviour is correct and unchanged, but
it now silently bricks a 60-day device session. The API side is fine; the companion app
must treat a `401` on refresh as *"re-link this device"* and drop into the device flow,
not as an error. Recorded here because it is a cross-repo obligation, not an API task.

**A 60-day refresh token on a personal machine** → Longer-lived than anything the system
issues today. Mitigated by the scope (the token reads one projection and cannot write
anything), by DPAPI/Keychain storage on the device, and by the new revocation path. The
scope is what makes the lifetime defensible, which is why they ship together — a device
flow shipped first would mint 60-day full-authority tokens that later scoping could not
retroactively narrow.

**The transponder projection drifts** → Decision 8, cost accepted. A functional test
asserting the full body against seeded fixtures is the guard.

**The shared `ADSB_CLIENT_TOKEN`** → Out of scope but noted so it is not mistaken for
solved. `adsb-receiver-api` authenticates with a single `CLIENT_TOKEN` bearer guard and
has no per-user concept; positions are cached by callsign behind a public
`DELETE /:callsign`. That token is compiled into a public release binary, so treat it as
public: anyone can extract it and inject or clear positions for any callsign. Fixing it
means teaching a second service to verify MyPreflight JWTs and resolve callsign
ownership — a cross-repository change unrelated to device login, and its own proposal.

## Migration Plan

1. **Schema.** Additive only: new `device_authorization` table and
   `DeviceAuthorizationStatus` enum; five nullable columns plus a scopes list on
   `jwt_refresh_token`. No backfill is required — existing session rows list as an
   unknown client and, having no scopes, remain full-authority, which is exactly their
   current behaviour. Locally apply with `prisma db push`; `migrate deploy` fails with
   P3005 against the dev database.
2. **Guard.** `ScopesGuard` ships inert: with no endpoint annotated and no token
   carrying scopes, it allows everything. Annotations and the first scoped token can
   land in the same deploy or a later one.
3. **Lifetime parameter.** Thread the TTL through `SessionService.open()`/`renew()` into
   `SessionRepository.create()`/`update()` with the current 7 days as the default, so the
   refactor is behaviour-preserving before any device session exists.
4. **Rollback.** Dropping the new columns and table is safe at any point; unscoped
   sessions are the pre-change behaviour, so a rollback degrades live device sessions to
   ordinary ones rather than breaking them. Revoke them from the session list if that
   matters.

Functional tests follow the house pattern: seed `device_authorization` rows with fixed
UUIDs in each state — pending, approved, denied, consumed, past-expiry — with known
plaintext device codes whose SHA-256 the seed stores, and assert against them. Do not
drive the flow end to end to manufacture state.

## Open Questions

- Whether the garbage-collection cron for expired authorizations is worth adding at all,
  given the scheduler is off locally and expiry is already derived. Rows are small and a
  manual sweep would do for a long time.
- Whether the transponder read wants a short user-aware cache once real polling load is
  observable (Decision 10).
- The exact copy and channel mix of the device-link notification, which belongs to the
  existing `transactional-email` capability rather than to this one.
