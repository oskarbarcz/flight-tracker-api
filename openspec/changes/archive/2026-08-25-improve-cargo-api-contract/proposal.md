## Why

The cargo work shipped a rich hold model, and then the people building against it went looking
for the contract and could not find it. Three things they need are described nowhere a client
can read: which special handling codes may arrive, which commodities may arrive, and which
nullable fields are actually numbers, strings or dates rather than opaque objects. A fourth —
whether anything aboard is incompatible with anything else — is computed at generation and then
discarded, so the one question the load model exists to answer cannot be asked of it.

None of this is a gap in what the system does. It is a gap in what the system says it does, and
it is spending the frontend's time on guesswork that the API already knows the answer to.

## What Changes

- **The manifest reports the segregation conflicts actually aboard.** Each compartment's
  incompatible special-handling pairs are reported on the cargo manifest, so a client can show
  a captain what is sharing a hold rather than reimplementing the matrix. Generation already
  refuses to create conflicts, so on a well-formed flight the list is empty — the value is that
  a load reconciled or seeded into a conflicting state is visible instead of silent.
- **Special handling codes are documented as the set they come from.** `shc` stops being an
  array of free-form strings in the published contract.
- **Commodities are documented as the set they come from.** `commodity` stops being an opaque
  slug in the published contract.
- **Hold layouts are curated for more airframe types**, starting with the one type in the
  seeded fleet that has none, so the hold diagram renders instead of degrading to a
  positionless list.
- **Nullable fields say what they are.** Every property the published document currently
  reports as a bare `object` because its `@ApiProperty` carried `nullable` without a type is
  given its real type. This is a repository-wide correction, not a cargo one: 133 properties
  across aircraft, airports, flights, operators, rotations, users, cabin layouts and cargo.

No endpoint is removed, no field is renamed, and no response value changes shape. Everything
here either adds a field or corrects what the contract claims about a field that already exists.

## Capabilities

### New Capabilities

- `api-contract-documentation`: the rules the published OpenAPI document must satisfy — a value
  drawn from a closed set is documented as that set, and a nullable value is documented with its
  type rather than as an untyped object.

### Modified Capabilities

- `flight-cargo-manifest`: the manifest additionally reports the segregation conflicts present
  in each compartment.
- `aircraft-hold-layout`: the curated catalogue covers every airframe type in the operated
  fleet, so the degraded path is reserved for genuinely unknown types.

## Impact

- `src/modules/manifest/` — the cargo manifest read model and its query, the segregation policy
  (already expressed as code families), and `data/cargo-holds.data.json`.
- Swagger decorators across every module: `aircraft`, `airports`, `airframes`, `auth`,
  `cabin-layouts`, `flights`, `manifest`, `operators`, `rotations`, `users`, plus the shared
  response DTOs in `src/core/http/response`.
- The published OpenAPI document, and therefore any client generating types from it. Clients
  that had inferred `unknown`/`object` for a nullable field will now receive its real type,
  which is a widening of information rather than a breaking change.
- No database migration, no seed reset, no change to any stored value.
