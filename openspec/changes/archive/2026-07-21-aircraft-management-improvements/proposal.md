## Why

Two related gaps make managing an operator's aircraft harder than it should be:

1. `selcal` is required and non-empty, but a SELCAL code is assigned by an operator's communication authority and is not always available at registration (new frames, freighters, GA types may never receive one) — so operators cannot record those aircraft at all.
2. An aircraft's home base airport can only be set by seeding the database; there is no API path for operations to assign it or correct it when a frame is permanently reassigned.

Both are small, additive improvements to the same capability, so they ship together.

## What Changes

- **SELCAL optional**: `selcal` may be omitted or sent as `null` on aircraft create/update; the stored/returned value is `null` when unknown. **BREAKING** for the request contract's validation (previously required). No SELCAL format constraint is added or removed.
- **SELCAL nullable in reads**: aircraft read models (get by id/registration, operator aircraft list, aircraft embedded in flight responses) expose `selcal` as a nullable string, documented as nullable in Swagger.
- **Base airport writable**: `baseAirportId` is a **required** field on the create-aircraft (`POST`) request and an optional field on the update-aircraft (`PATCH`) request; operations must set it at creation and can change or clear it afterwards.
- **Base airport initialises last airport**: on creation the aircraft's `lastAirportId` is set to its `baseAirportId`, so a newly created aircraft is located at its base.
- **Livery optional with a default**: `livery` becomes optional on create; when omitted it defaults to `"<operator short name> <current year>"` (e.g. `"Lufthansa 2026"`). A provided livery must still be non-empty.
- **Base airport validated**: an absent `baseAirportId` on create is rejected with `400 Bad Request`, and a `baseAirportId` that does not reference an existing airport with `404 Not Found`, via a dedicated `AssertAirportExistsQuery` (a lightweight `count`-based existence check, not a full airport fetch); the aircraft response continues to expose the resolved `baseAirport` object (no response-shape change).
- Endpoints stay operations-gated; no new RBAC surface.

## Capabilities

### New Capabilities

- `aircraft-management`: Recording an operator's aircraft and the attributes required to create and represent one — establishing that SELCAL is optional and that operations can set/change an aircraft's base airport.

### Modified Capabilities

<!-- None on main: aircraft-management has no archived spec yet. -->

## Impact

- **Schema/DB**: `Aircraft.selcal` → nullable (new migration). `Aircraft.baseAirportId` already exists (nullable scalar FK) — no change.
- **API contract** (`src/modules/operators/infra/http/request/aircraft.request.ts`): `selcal` becomes optional/nullable; add optional `baseAirportId`. `UpdateAircraftRequest` inherits both via `PartialType`.
- **Response model** (`src/modules/operators/model/aircraft.model.ts`): `selcal` becomes nullable. `baseAirport` already returned — unchanged.
- **Command handlers**: `CreateAircraftHandler` / `UpdateAircraftHandler` gain `QueryBus` and validate `baseAirportId` via `GetAirportByIdQuery` when present.
- **Read paths**: query handlers and `flights.repository` aircraft expansion propagate a nullable `selcal` (no logic change); base-airport reads unchanged.
- **Seed** (`prisma/seed/resource/aircrafts.seed.ts`): keeps SELCAL values; one fixture gains a `null` SELCAL to cover the optional path.
- **Functional tests**: `features/operator/aircraft/aircraft.create.feature` and `aircraft.update.feature` gain SELCAL-optional and base-airport scenarios; `selcal` drops out of the missing-fields 400 case.
