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

- Self-service change of `email`, `password`, `role`, `homeAirportId`, or
  `simbriefUserId`. Email and password have their own changes; `role` and
  `homeAirportId` stay administrative.
- Touching the admin `PATCH /api/v1/user/:id` endpoint or its DTO.
- Any new profile field.

## Decisions

**1. A dedicated `UpdateOwnProfileDto`, not a `PickType` of `UpdateUserDto`.**
The DTO declares `name?: string` and `pilotLicenseId?: string | null` with the
same `class-validator` rules as `User` (`@IsString() @IsNotEmpty()` for the name;
`@Matches(/^[A-Za-z]{2}-\d{5}$/)` for the license), both `@IsOptional()`.
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

**6. Write-then-read, returning `GetUserDto`.** The action dispatches the command
then reads back through `GetUserByIdQuery`, matching `UpdateUserAction` and the
house style. `GetUserDto` already omits the password.

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
  (unlike `homeAirportId`, which is not self-service).
