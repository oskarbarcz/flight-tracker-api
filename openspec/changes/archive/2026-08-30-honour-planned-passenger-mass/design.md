## Context

See proposal.md — Why.

Three facts about the current code shape the approach:

- `Loadsheet` is one class serving three roles at once: the `@Body()` type of
  `PATCH /flight/{id}/loadsheet/preliminary` and `POST /flight/{id}/finish-boarding`, the stored
  shape inside the flight's `loadsheets` JSON column, and the read model. Anything added to it is
  addable by a client unless something stops it.
- Input validation runs with `whitelist: true, forbidNonWhitelisted: true`
  (`src/core/validation/validation.config.ts`). An undeclared property in a request body is a 400
  naming the field, not a silently dropped one.
- `loadsheets` is a Prisma `Json` column (`schema.prisma:252`), so a new loadsheet field needs no
  migration. Flights stored before this change simply carry no mass.

## Goals / Non-Goals

**Goals:**

- The payload floor rests on a mass the loadsheet owns, so an imported plan is measured against
  the figures it was planned with.
- A client that reads a flight and writes the same loadsheet back keeps working, unchanged.
- No loadsheet accepted today becomes rejected.

**Non-Goals:**

- Changing how baggage is derived. `planBaggage` keeps its own `STANDARD_ADULT_KG` residual
  (`manifest/model/baggage.ts`): an imported plan's residual is near zero at either mass, so it
  falls to derived bags either way, and the manifest capability is not what this change is about.
- Reading a passenger mass field from the SimBrief API. The plan's own payload and cargo already
  state it, and deriving it from those two needs no new provider field and no assumption about
  whether the plan counts bags inside its cargo or inside its passengers.
- Validating the loadsheet on the import path. That asymmetry is what made the bug invisible, but
  once an imported plan satisfies the floor by construction there is nothing left to catch, and
  asserting there would turn a provider quirk into a failed import.

## Decisions

### The mass lives on the loadsheet, in kilograms per passenger

`Loadsheet` gains `passengerMass?: number | null` — kilograms, not tons.

Storing kilograms breaks the "everything is tons" convention the loadsheet otherwise keeps, and
that is deliberate: a per-passenger mass of `0.084` tons reads as a mistake, `84` reads as the
standard adult mass every operations person already knows. `STANDARD_ADULT_KG` is in kilograms for
the same reason.

Storing the mass rather than a total passenger allowance in tons means the floor keeps working
when the passenger count is edited afterwards, which is the whole point of a floor.

*Alternative considered:* store nothing and lower the constant to a permissive floor (~60 kg). It
fixes the symptom without a schema change, but the floor stops being a consistency check and
becomes a guess that happens to be low enough.

### The mass is derived at import from the plan's own figures

At import: `(payload − cargo) ÷ passengers`, in kilograms, **rounded down** to 0.1 kg.

Rounding down matters. The floor is `payload ≥ cargo + passengers × mass`; rounding the mass up
would let float noise make an imported loadsheet fail the floor derived from it. Rounding down
makes the imported sheet satisfy its own floor by construction.

Zero passengers derives no mass — the division has no meaning, and the floor correctly degenerates
to `payload ≥ cargo`.

*Alternative considered:* capping the derived mass at 84 kg so the floor can never get stricter
than today. Rejected: a plan built at 86 kg per passenger genuinely has that much payload
committed, and capping would let a later hand edit spend it twice.

### The mass is declared on the write DTO but overwritten by the handler

This is the one non-obvious choice. `passengerMass` is declared on `Loadsheet` with an
`@IsOptional()` validator — so a client may send it — and both command handlers then replace
whatever arrived with the value already stored on the flight, before the floor is asserted.

Declaring it and ignoring it looks weaker than omitting it from the request type. It is the
opposite. With `forbidNonWhitelisted: true`, omitting it would make `PATCH` reject any body
containing `passengerMass` — and the body a client is most likely to send is the one it just read
back from `GET /flight/{id}`, which contains it. Omitting the field would reintroduce the reported
bug in a new form: read the flight, write it back unchanged, get an error.

So the field is accepted at the edge and discarded in the domain. `@ApiProperty({ readOnly: true })`
documents that in the OpenAPI contract.

Preliminary updates carry the mass forward from the stored preliminary loadsheet;
`finish-boarding` seeds the final loadsheet's mass from the preliminary one, so the final sheet is
measured against the plan the flight was built from.

### Imported weights stop being rounded to 0.1 t

`ofpWeightToTons` becomes a round to 3 decimals. `Loadsheet.cargo` moves from
`maxDecimalPlaces: 2` to `3`, matching `payload`, `zeroFuelWeight` and `blockFuel` — otherwise
cargo alone stays lossy and can still round up past a payload rounded to the kilogram.

This is a fix in its own right, independent of the mass: it removes up to 100 kg of shortfall that
no configuration setting explains.

## Risks / Trade-offs

- **A loadsheet field that a client may send and the server ignores is a contract that lies about
  itself.** → `readOnly: true` in the OpenAPI schema, and a spec scenario pinning the behaviour so
  it cannot be quietly changed to a 400 later.
- **Flights imported before this change keep their 0.1 t weights and carry no mass, so they stay
  broken.** → They are measured against 84 kg exactly as today; nothing regresses, but a
  pre-existing flight stuck on this error still needs its payload edited by hand. A backfill is not
  worth it: the affected flights are in `created` status and are cheap to re-import.
- **The floor gets stricter for a plan built at more than 84 kg per passenger.** → Only on a later
  hand edit; the imported sheet itself always passes, by construction of the derivation.
- **`cargo` widening to 3 decimals is an API contract change.** → Widening only. Every value valid
  today stays valid.

## Migration Plan

No data migration. `loadsheets` is a JSON column and the field is optional; existing flights read
back with no mass and fall to `STANDARD_ADULT_KG`, which is the behaviour they have now.

This change modifies a requirement that currently lives in `harden-cargo-load-planning`'s delta
rather than in `openspec/specs/flight-fuel-planning/spec.md`. That change is complete but not
archived, so it must be synced or archived before this one is.

Rollback is a revert: the field becomes unread, and the floor returns to the constant.
