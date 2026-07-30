## Context

Today `users` has one write action for user attributes: `UpdateUserAction`
(`PATCH /api/v1/user/:id`, `@Role(UserRole.Admin)`) which passes an
`UpdateUserDto` — `PartialType(CreateUserDto)`, i.e. **every** writable field
including `role`, `email` and `password` — straight into
`UsersRepository.update`. That repository method already enforces the cabin-crew
pilot-license and home-airport rules, hashes a supplied password, and invalidates
the `PILOT_CARD` and `USER_ME` cache keys.

The global validation pipe runs with `whitelist: true` **and**
`forbidNonWhitelisted: true` (`src/core/validation/validation.config.ts`), so a
property absent from a DTO is a `400` with a `violations` map rather than being
silently stripped. That is the mechanism this change relies on to keep
self-service narrow.

`GET /api/v1/user/me` already exists (`GetCurrentUserAction`) and resolves the
caller from `request.user.sub`.

## Goals / Non-Goals

**Goals:**

- One self-service write endpoint whose accepted field set is enforced by the type
  system and the validation pipe, not by a runtime filter.
- Reuse the existing repository invariants and cache invalidation rather than
  duplicating them.

**Non-Goals:**

- Self-service change of `email`, `password`, or `role`. Email and password have
  their own changes; `role` stays administrative.
- Touching the admin `PATCH /api/v1/user/:id` endpoint or its DTO.
- Any new profile field, or exposing `simbriefUserId` on administrative reads.

## Decisions

**1. A dedicated `UpdateOwnProfileDto`, not a `PickType` of `UpdateUserDto`.**
The DTO declares `name?: string`, `pilotLicenseId?: string | null`,
`homeAirportId?: string` and `simbriefUserId?: string | null` with the same
`class-validator` rules as `User` (`@IsString() @IsNotEmpty()` for the name;
`@Matches(/^[A-Za-z]{2}-\d{5}$/)` for the license; `@IsUUID()` for the airport).
_Alternative considered:_ `PickType(UpdateUserDto, ['name', 'pilotLicenseId'])`.
Rejected — a `PickType` re-derives from `CreateUserDto`, so a future field added
there could silently widen the picked shape's provenance, and the Swagger
`required` flags come out wrong for a partial. An explicit DTO also documents the
self-service contract in one readable place.

**2. `forbidNonWhitelisted` is the escalation guard.** Because the pipe is already
configured to reject unknown properties, `{"role":"admin"}` on this endpoint is a
`400` before any handler runs. No extra allow-list check in the handler.
_Alternative considered:_ accepting the wide DTO and deleting privileged keys in
the handler. Rejected — silent stripping hides a caller's mistake and the
guarantee lives far from the contract.

**3. Route order: register `UpdateOwnProfileAction` before `UpdateUserAction` in
`users.module.ts`.** Both are `@Controller('/api/v1/user')`; `PATCH /me` must be
matched before `PATCH :id`, otherwise `UuidParam('id')` rejects `me` with a `400`.
This mirrors the existing `GetCurrentUserAction`-before-`GetUserAction` order in
the same `controllers` array, so the convention is already established — but it is
an ordering dependency worth stating, since it is invisible in the action files
themselves.

**4. Reuse `UsersRepository.update` unchanged.** Passing
`{ name?, pilotLicenseId? }` satisfies its `UpdateUserDto` parameter, and the
existing pilot-license guard (`newRole !== CabinCrew && data.pilotLicenseId`)
produces the correct rejection for a non-cabin-crew caller because `data.role` is
`undefined`, so `newRole` falls back to the stored role. Cache invalidation for
both `PILOT_CARD` and `USER_ME` is already at the end of that method.
_Alternative considered:_ a narrow `updateOwnProfile` repository method. Rejected
as duplication — there is no behavior to add.

**5. New command rather than reusing `UpdateUserCommand`.** `UpdateOwnProfileCommand(userId, data)`
carries the narrow DTO type, so the compiler prevents a future caller from routing
privileged fields through the self-service path. The handler body is a one-line
delegation, which is consistent with `UpdateUserHandler`.

**6. Write-then-read, returning `GetOwnUserDto`.** The action dispatches the command
then reads back through `GetOwnUserQuery`, matching `UpdateUserAction` and the house
style.

**7. `simbriefUserId` is exposed on own-user reads only, via a second response DTO.**
`GetUserDto` omits `simbriefUserId`, so returning it would leave a field a user can
write but never read. The fix is `GetOwnUserDto extends OmitType(User, ['password'])`
— the same shape plus that one field — backed by `UsersRepository.findOwnById` and a
`GetOwnUserQuery`. `GetCurrentUserAction` and the new action use it; the
administrative read, the user list, and every embedded pilot view keep `GetUserDto`.
_Alternative considered:_ stop omitting `simbriefUserId` from `GetUserDto` entirely.
Rejected — it would widen the response of the admin read and the user list, changing
contracts this change has no reason to touch, and it hands one user's Simbrief
identity to every other reader of the list.
_Alternative considered:_ leave the field write-only. Rejected — a user cannot
confirm what they stored, and the update response would not echo what they just sent.

**8. Clearing is allowed for the pilot license and the Simbrief ID, refused for the
home airport.** `pilotLicenseId: null` and `simbriefUserId: null` are accepted:
both are nullable and optional in the domain, and `@IsOptional()` skips validation
for `null` as well as `undefined`. A home airport is different — `create` enforces
`CabinCrewMustHaveHomeAirportError`, so a cabin crew member without one is an invalid
state, and `update` does not re-check it. Rather than let self-service produce a state
creation forbids, `homeAirportId` uses
`@ValidateIf((profile) => profile.homeAirportId !== undefined)` + `@IsUUID()` instead
of `@IsOptional()`: an omitted field is skipped, while an explicit `null` reaches
`@IsUUID()` and is rejected. The field is therefore typed `string`, not
`string | null`.

**9. The home airport is asserted to exist, on every write path.** The command handler
dispatches `AssertAirportExistsQuery` (owned by the `airports` module) through the
`QueryBus` before touching the repository — the pattern `UpdateAircraftHandler`
already uses for `baseAirportId`. No module import is needed: `CqrsModule.forRoot()`
registers handlers globally. The same three lines went into `CreateUserHandler` and
`UpdateUserHandler`, because the gap was theirs too: `homeAirportId` is a raw FK and
an unknown-but-well-formed UUID previously surfaced as a Prisma error rather than a
domain error. Putting the assert in the handlers rather than in `UsersRepository`
keeps `PrismaService` and cross-module reads on the right sides of the layer boundary.
_Alternative considered:_ catching the Prisma foreign-key violation in the repository
and rethrowing a domain error. Rejected — it makes the rule implicit, ties the code to
a Prisma error code, and cannot distinguish which FK failed.

## Risks / Trade-offs

- **[Two endpoints mutate the same fields]** `PATCH /me` and `PATCH /:id` can both
  write `name`/`pilotLicenseId`, so an invariant added later must be added to the
  repository, not to one action. → Mitigated by keeping all rules in
  `UsersRepository.update`, which both paths already share.
- **[Route-order fragility]** Reordering the `controllers` array would break `/me`
  with a confusing `400`. → A functional scenario hits `PATCH /me` directly, so a
  regression fails the suite rather than reaching production.
- **[`pilotLicenseId: null` is accepted]** A cabin crew member can clear their own
  license by sending `null`. → Accepted: the field is nullable in the schema and
  administrators can restore it; no invariant requires cabin crew to hold one
  (unlike `homeAirportId`, which per decision 8 cannot be cleared).
- **[Airport-existence checking now runs on the admin paths too]** Per decision 9 the
  assert was added to `CreateUserHandler` and `UpdateUserHandler` as well, so a
  well-formed UUID for a missing airport is now a `404` there where it previously
  reached the foreign key. → Intended: the previous behavior was a Prisma error
  surfacing as a `500`. No existing scenario submitted a non-existent airport, so
  nothing regressed; two scenarios were added to pin the admin behavior.
- **[The pilot card's freshness has no clean HTTP surface to assert]** The repository
  discards the cached pilot card on update, but the only endpoints that render it are
  `GET /api/v1/flight/:id` (itself cached for 60s, and not invalidated by a user
  write) and `GET /api/v1/flight` (uncached, but returning the whole paginated list).
  Asserting through the former would both read stale data left by the flight suite and
  poison later flight scenarios with a mutated captain name. → The requirement is
  specified and the invalidation is exercised by the existing repository code; no
  functional scenario asserts it. Recorded in tasks rather than papered over.
