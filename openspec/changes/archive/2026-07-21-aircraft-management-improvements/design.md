## Context

This change bundles two independent improvements to the aircraft write/read surface in the `operators` module. They share files (`aircraft.request.ts`, the create/update command handlers, the aircraft feature tests) but do not depend on each other.

**SELCAL** is a non-null `String` column and a required, non-empty field on both `CreateAircraftRequest` and the `Aircraft` response model (`@IsString() @IsNotEmpty()`). It is free-form today (no `@Length`/`@Matches`) and flows read-only through the aircraft query handlers, the operator aircraft list, and the aircraft object embedded in flight responses.

**Base airport** already exists in persistence: `Aircraft.baseAirportId` is a nullable scalar FK with a `baseAirport` relation, and the read models already resolve and return the `baseAirport` object. What is missing is any write path — `baseAirportId` is not on the create/update requests. Cross-module airport existence is already validated elsewhere (`create-manual-reposition`, `create-manual-travel`) by dispatching `GetAirportByIdQuery` on the `QueryBus`, which throws `AirportNotFoundError` (→ 404).

## Goals / Non-Goals

**Goals:**

- Allow an aircraft to exist with no SELCAL code (omitted or `null`), consistently `string | null` everywhere it is represented.
- Let operations set `baseAirportId` at creation and change/clear it on update, rejecting unknown ids with 404.
- Preserve existing seeded SELCAL values and existing DB rows.

**Non-Goals:**

- No SELCAL format validation (still free-form when present).
- No new endpoint and no aircraft response-shape change (base airport already returned).
- No change to `lastAirport`/reposition history; base airport is independent.

## Decisions

### SELCAL

- **Nullable column, not empty-string sentinel.** `selcal String?` in Prisma models "unknown" as SQL `NULL`, matching `etopsThresholdMinutes` / `lastAirportId`. An empty string is not semantically "no SELCAL".
- **Request: `@IsOptional()`, drop `@IsNotEmpty()`, type `selcal?: string | null`.** `UpdateAircraftRequest` inherits via `PartialType`.
- **Response model `@ApiProperty({ nullable: true })`, `selcal!: string | null`.** Query handlers and `flights.repository`'s `expandAircraftAirframe` already pass `aircraft.selcal` straight through; only the generated type flips.
- **Seed coverage.** Keep all current SELCAL values; set exactly one existing fixture's `selcal` to `null` so the no-SELCAL read path is exercised.

### Base airport

- **Required UUID on create, optional on update.** `CreateAircraftRequest.baseAirportId!: string` with `@IsUUID()` (no `@IsOptional()`), so an absent value fails validation with `400`. `UpdateAircraftRequest` inherits it via `PartialType`, which re-adds `@IsOptional()` — so on PATCH the field may be omitted (no-op), set to a new id (reassign), or `null` (clear). `@IsOptional()` already treats `null` as "missing" and skips `@IsUUID()`, so no `@ValidateIf` guard is needed.
- **Creation initialises `lastAirportId` to the base.** The repository `create` sets `lastAirportId: data.baseAirportId` alongside the spread `{ id, ...data, operatorId }` — the same place it already injects `operatorId`. `lastAirportUpdatedAt` is left `null` (no movement has occurred). Update never touches `lastAirportId`.
- **Dedicated `AssertAirportExistsQuery` for existence.** Rather than `GetAirportByIdQuery` (which runs `findOneBy` selecting all columns incl. the heavy `shape` polygon, then maps a full `GetAirportResponse`), both handlers dispatch `AssertAirportExistsQuery` — a `QueryHandler` in the airports module that calls `airportsRepository.exists()` and throws `AirportNotFoundError` (404). `exists()` itself is switched from `findOneBy` to a `count`, which is a strict win for every existing caller (gates/runways/terminals/parking checks). Create always asserts (base is required); update asserts only when `baseAirportId` is present. `QueryBus` is injected into both handlers.
- **No repository change for the FK itself.** `baseAirportId` is a scalar FK covered by the existing create/update `data` spread.

### Livery

- **Optional on create, `@IsNotEmpty()` when present.** `CreateAircraftRequest.livery?: string` keeps `@IsString() @IsNotEmpty()` behind `@IsOptional()`, so an omitted livery is allowed but an empty string is a `400`.
- **Default resolved in the handler.** The create handler now fetches the operator via `operatorsRepository.findOneBy({ id })` (instead of `exists()`, since it needs `shortName`) and computes `data.livery ?? \`${operator.shortName} ${new Date().getFullYear()}\``. The resolved value is passed to the repository.
- **Repository param tightened.** Because the DTO's `livery` is optional but the Prisma column is required, `AircraftRepository.create` takes `CreateAircraftRequest & { livery: string }` — the type forces the caller to resolve the default first, keeping the `{ ...data }` spread valid without a cast.
- **Testing the year without brittleness.** A `@defaultLivery('<shortName>')` matcher in `deep-compare` asserts `actual === \`<shortName> <current year>\``, mirroring the existing `@date('within 1 minute from now')` dynamic matcher, so the assertion never rots at year boundaries.

## Risks / Trade-offs

- **Client assumes `selcal` always present** → response now documents `nullable: true`; called out as BREAKING. No internal consumer branches on SELCAL.
- **Migration on a populated table** → widening `NOT NULL` to nullable is a safe, non-rewriting Postgres change; rows keep their values. Rollback requires all rows non-null before re-adding `NOT NULL`.
- **Ambiguous 404 on update** (missing aircraft vs missing base airport) → run the base-airport validation last, after operator/aircraft existence checks, so the correct typed error/message surfaces; feature tests assert the specific message.
- **Livery optional in the DTO vs required in Prisma** → the handler resolves the default and `AircraftRepository.create` requires a resolved `livery` in its param type, so the mismatch is caught at compile time rather than persisting an `undefined`.
- **Functional test drift** → the missing-fields 400 scenario in `aircraft.create.feature` now asserts a `baseAirportId` violation (and no longer a `selcal` one); the year in the default livery is asserted via a dynamic `@defaultLivery(...)` matcher, not a literal.

## Migration Plan

1. `schema.prisma` (`selcal String?`) → generate migration, apply with `prisma db push` (per project guidance; `migrate deploy` P3005-fails locally).
2. Update `aircraft.request.ts` (selcal optional + `baseAirportId`), `aircraft.model.ts` (selcal nullable), and the seed fixture.
3. Inject `QueryBus` and add base-airport validation to both command handlers.
4. Regenerate the Prisma client, rebuild.
5. Update the create/update functional features and run the aircraft suite.

Base airport is a pure code revert; SELCAL rollback re-adds `NOT NULL` only after ensuring no `NULL` rows.
