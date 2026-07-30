## Why

A signed-in user cannot edit their own profile. The only write path for user data
is `PATCH /api/v1/user/:id`, which is `@Role(UserRole.Admin)`-gated, so a cabin
crew member who mistyped their name, received a new pilot license, moved to a
different home base, or wants to connect their Simbrief account has to ask an
administrator to do it. Users own this data and should maintain it themselves.

## What Changes

- Add `PATCH /api/v1/user/me` — any authenticated user updates **their own**
  `name`, `pilotLicenseId`, `homeAirportId` and `simbriefUserId`, and receives the
  updated user back.
- The request body is a dedicated narrow DTO accepting only those four fields.
  Every other user attribute (`email`, `password`, `role`, `currentFlightId`,
  `lastAirportId`, `lastAirportUpdatedAt`, `id`) is rejected as an unknown property
  by the global validation pipe — self-service must never be a role-escalation or
  credential-change path.
- The existing role rules keep applying: only cabin crew may hold a `pilotLicenseId`
  or a `homeAirportId`. A cabin crew member may clear their pilot license but not
  their home airport, which they are required to have.
- A submitted `homeAirportId` must identify an existing airport, or the request is
  rejected as `404`. This check is added to the admin create and update paths as well:
  `homeAirportId` is a raw foreign key there too, so an unknown-but-well-formed UUID
  previously surfaced as a Prisma error instead of a domain error.
- `GET /api/v1/user/me` and the profile-update response expose `simbriefUserId`,
  which the shared user response omits — otherwise a user could set the field and
  never see it. Administrative user reads and the user list keep their current
  shape.
- The admin endpoints keep their request and response shapes; the only change to them
  is the airport-existence rejection above.

No breaking API changes: one new endpoint, one additive field on the two own-user
reads, and one previously-crashing admin input that now returns `404`.

## Capabilities

### New Capabilities

- `user-profile-self-service`: an authenticated user reads and maintains their own
  profile attributes, distinct from administrative user management.

### Modified Capabilities

- _None._ Existing admin user management has no spec of its own, and its behavior
  does not change.

## Impact

- **`users` module:** new `UpdateOwnProfileCommand` + handler; new
  `UpdateOwnProfileAction` (`PATCH /me`, no role gate, write-then-read); new
  `UpdateOwnProfileDto`. Registered in `users.module.ts` with the action **before**
  `UpdateUserAction` so `/me` is matched ahead of `:id`.
- **Airport assert:** the three user-write handlers (own-profile, admin create, admin
  update) dispatch the existing `AssertAirportExistsQuery` through the `QueryBus` when
  a `homeAirportId` is present — the pattern `UpdateAircraftHandler` already uses. No
  new module import: the CQRS bus is global.
- **Own-user read shape:** new `GetOwnUserDto` (the shared user response plus
  `simbriefUserId`), `UsersRepository.findOwnById`, and a `GetOwnUserQuery` +
  handler. `GetCurrentUserAction` switches from `GetUserByIdQuery` to it, so
  `GET /api/v1/user/me` gains the field.
- **Reuses `UsersRepository.update`,** which already enforces the cabin-crew
  pilot-license and home-airport rules and already invalidates the `PILOT_CARD` and
  `USER_ME` cache entries — so own-user reads and the pilot card reflect the change
  immediately.
- **No schema/migration change.**
- **Functional tests:** new `features/user/user.me.update.feature`. Three existing
  files gain the additive `simbriefUserId` field in their `/me` assertions:
  `user.me.feature` (3 bodies) and `user.travel.create.feature` (1 body).
- **Sequencing:** independent — no dependency on the other credential
  self-service changes.
