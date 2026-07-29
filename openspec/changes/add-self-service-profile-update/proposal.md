## Why

A signed-in user cannot edit their own profile. The only write path for user data
is `PATCH /api/v1/user/:id`, which is `@Role(UserRole.Admin)`-gated, so a cabin
crew member who mistyped their name or received a new pilot license has to ask an
administrator to fix it. Users own this data and should maintain it themselves.

## What Changes

- Add `PATCH /api/v1/user/me` — any authenticated user updates **their own**
  `name` and `pilotLicenseId`, and receives the updated user back.
- The request body is a dedicated narrow DTO accepting only those two fields.
  Every other user attribute (`email`, `password`, `role`, `homeAirportId`,
  `simbriefUserId`, `currentFlightId`, `lastAirportId`) is rejected as an unknown
  property by the global validation pipe — self-service must never be a
  role-escalation or credential-change path.
- The existing "only cabin crew may hold a pilot license" rule keeps applying, so
  a non-cabin-crew user setting `pilotLicenseId` is rejected.
- The admin endpoint `PATCH /api/v1/user/:id` is unchanged.

No breaking API changes: this is one new endpoint.

## Capabilities

### New Capabilities

- `user-profile-self-service`: an authenticated user reads and maintains their own
  profile attributes, distinct from administrative user management.

### Modified Capabilities

- _None._ Existing admin user management has no spec of its own, and its behavior
  does not change.

## Impact

- **`users` module:** new `UpdateOwnProfileCommand` + handler; new
  `UpdateOwnProfileAction` (`PATCH /me`, no role gate, write-then-read via
  `GetUserByIdQuery`); new `UpdateOwnProfileDto`. Both registered in
  `users.module.ts` — the action **before** `UpdateUserAction` so `/me` is matched
  ahead of `:id`.
- **Reuses `UsersRepository.update`,** which already enforces the cabin-crew
  pilot-license rule and already invalidates the `PILOT_CARD` and `USER_ME` cache
  entries — so `GET /api/v1/user/me` and the pilot card reflect the change
  immediately.
- **No schema/migration change.**
- **Functional tests:** new `features/user/user.me.update.feature`.
- **Sequencing:** independent — no dependency on the other credential
  self-service changes.
