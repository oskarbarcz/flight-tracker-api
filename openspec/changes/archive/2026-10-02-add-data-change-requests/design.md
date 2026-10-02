## Context

The only approval queue in the codebase today is `DelayReport` (`flights` module): pending →
accepted/rejected, `reportedById`, `decidedById`, `rejectionReason`, `decidedAt`, an index on
status, and one action per transition under `infra/http/action/delay/`. Its shape fits this change
well, but it hangs off one parent (`DelayRequest`) with a real foreign key and lives inside the
module that owns the data. Neither suits a queue meant to span airports, runways, terminals,
parking stands and gates.

The OSM enrichment review (`airports/model/osm-upgrade.model.ts`) already exposes a field-level
diff, `{ field, current, proposed }`, and a resource vocabulary (`airport`, `runway`, `terminal`,
`parkingPosition`, `gate`). Reviewers already know that shape from the enrich screen.

Airport writes go through `UpdateAirportCommand`. It takes the city as a **name** and resolves it
find-or-create, renaming the current city in place when it is the airport's only one. A crew
proposal names an existing city **by id**, and reassigning an airport by id must never rename or
create a city.

Roles do not inherit: `@Role(UserRole.Operations, UserRole.Admin)` must list both.

## Goals / Non-Goals

**Goals:**

- One table, one review API and one set of transitions for every kind of reference data.
- Adding a kind takes an enum value, a target adapter and a submit action — nothing in the queue.
- The airports module stays the only writer of airport rows; the queue reaches it over the bus.

**Non-Goals:**

- Per-field acceptance, conflict detection or optimistic locking (last write wins, by decision).
- Notifying the requester of a decision; an event is emitted, but nothing listens to it yet.
- Proposals for runways, terminals, parking stands or gates (only the seam is built).
- Proposals that create or delete records; this change covers edits to existing ones only.
- Proposals from operations or admins.

## Decisions

**1. A new `change-requests` module, not an extension of `airports`.**
The queue is a domain of its own: it gets a new table, its own lifecycle and its own endpoints, and
it will span modules. Following the extract-domain-module rule, it owns its repository and talks to
`airports` only through `QueryBus` and `CommandBus`. The alternative — a queue in each owning module,
modelled on `DelayReport` — would give reviewers four queues and repeat the transitions four times.

**2. A polymorphic `ChangeRequest` row.**

```
ChangeRequest
  id, resource ChangeRequestResource      -- enum: airport (later runway, terminal, parkingPosition, gate)
  targetId Uuid                           -- no FK: the target table depends on resource
  payload Json                            -- proposed fields only, already validated
  status ChangeRequestStatus @default(pending)   -- pending | accepted | rejected | withdrawn
  requestedById Uuid -> User
  decidedById Uuid? -> User
  rejectionReason String?
  appliedSnapshot Json?                   -- target's touched values just before an accept, for audit
  decidedAt DateTime?, createdAt DateTime @default(now())
  @@index([status, resource]), @@index([resource, targetId]), @@index([requestedById])
```

Without a foreign key, deleting an airport leaves its proposals orphaned. That is handled at read
and accept time (Decision 5) instead of with a cascade, so the audit trail of decided proposals
survives the deletion. `withdrawn` is a status rather than a hard delete for the same reason.

**3. The `ChangeRequestTarget` adapter is the seam for new kinds of data.**

```ts
interface ChangeRequestTarget<P> {
  resource: ChangeRequestResource;
  fields: readonly string[];                                   // whitelist; also the order fields are reported in
  validate(targetId: string, changes: P): Promise<void>;       // existence checks via QueryBus, run at submission
  read(targetId: string): Promise<Record<keyof P, unknown>>;   // via QueryBus; throws ChangeRequestTargetNotFoundError
  apply(targetId: string, payload: P): Promise<void>;          // via CommandBus to the owning module
}
```

Adapters are registered under a `CHANGE_REQUEST_TARGETS` multi-provider and looked up by
`resource`. List, get-with-diff, accept, reject and withdraw are written once against this
interface. Only submission is per kind: each kind gets its own action and request DTO, so Swagger
documents a typed body for each and `class-validator` checks it. The rejected alternative, one
generic `POST /user-data-change-request` with a free-form `payload`, would lose both.

**4. Airport submission.** `POST api/v1/airport/:airportId/request-data-change`, `@Role(CabinCrew)`,
with body `RequestAirportChangeRequest`:

- `PartialType(PickType(Airport, ['continent','name','country','timezone','location','shape']))`,
  so the same validators as the airport model apply, including country normalisation and
  `@IsCountryCode`;
- plus `cityId?: string` (`@IsUUID('4')`);
- with a class-level check that at least one field is present (400 when the body is empty).

Submission is one generic `SubmitChangeRequestHandler(resource, targetId, changes, requester)`.
It keeps only the adapter's whitelisted fields and answers `EmptyChangeRequestError` (400) when none
remain. It then calls `target.validate`, which for airports asserts the airport exists
(`AssertAirportExistsQuery`, 404) and the city exists (new `AssertCityExistsQuery` in `airports`,
404). It reads the current values through the adapter, rejects the request with
`NothingToChangeError` (422) when no proposed value differs, and finally stores the proposal.

The route sits under `airport/:airportId` so it reads naturally, but the action class belongs to
`change-requests`. Nest routes by path, not by module, so this works.

**5. Accepting is last write wins.** `AcceptChangeRequestHandler` does three things:

1. Loads the request. It answers 404 when the request is missing and 409
   (`ChangeRequestNotPendingError`) when it is not pending.
2. Calls `target.read` and stores the touched fields as `appliedSnapshot`. When the target is gone
   this answers 404 (`ChangeRequestTargetNotFoundError`) and the request stays pending.
3. Calls `target.apply` and then marks the request accepted.

Steps 2 and 3 run without a cross-module transaction. If `apply` fails, the request stays
pending, and a retry is safe because applying the same values twice is idempotent.

The status write is a conditional update (`WHERE status = 'pending'`). Two reviewers deciding at
the same moment therefore resolve to one winner; the other gets a 409.

**6. Airport apply goes through the existing update command, plus a city-by-id command.** The
airport adapter's `apply` does two things:

- It dispatches `UpdateAirportCommand` with the scalar fields, without `city`, so the
  find-or-create and rename logic never runs.
- When `cityId` is present, it also dispatches a new `ReassignAirportCityCommand(airportId,
  cityId)`. That command only sets the foreign key. It emits no city event, because no city is
  created or renamed.

This is the only change inside `src/modules/airports/`, and the existing `PATCH` endpoint is
untouched. `dataQuality` is not part of the payload, so it cannot change. That also satisfies the
`airport-data-curation` delta.

**7. The diff is computed live and is pure.** `model/change-request.diff.ts` exports
`diffChangeRequest(current, payload): ChangedField[]`, where `ChangedField = { field, current,
proposed }`, matching the OSM enrich shape. Its rules:

- It covers only the fields present in the payload.
- Geometry (`location`, `shape`) is compared by deep equality.
- `cityId` is compared against the airport's `city.id`.

`GET user-data-change-request/:id` returns the stored request plus this diff against live data, so drift
since submission is visible (spec: "Drift since submission is visible"). The function sits next to
a colocated Jest `change-request.diff.spec.ts`.

**8. Endpoints and roles.**

| Method & path                            | Roles            | Notes                                                                        |
| ---------------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| `POST airport/:airportId/request-data-change` | CabinCrew        | 201 + request with live `fields`                                             |
| `GET user-data-change-request?status&resource`     | Operations, Admin | oldest first; `resource` is enum-validated (400 lists supported kinds)      |
| `GET user-data-change-request/:id`                 | Operations, Admin | request + live `fields`                                                     |
| `POST user-data-change-request/:id/accept`         | Operations, Admin | 200 + request with live `fields`                                            |
| `POST user-data-change-request/:id/reject`         | Operations, Admin | body `{ rejectionReason }` `@IsNotEmpty`; 200 + request with live `fields`  |
| `GET user/me/data-change-request?status`      | CabinCrew        | own only, newest first; `status` enum-validated                              |
| `DELETE user-data-change-request/:id`              | CabinCrew        | own pending only; 403 for others, 409 when not pending; 204                  |

Each action is one controller class under `infra/http/action/<group>/`, and dispatches through a
`const command = new …` variable. Every handler and action is registered in
`change-requests.module.ts`.

The `GET user/me/data-change-request` route lives in `change-requests`, not `users`. Nest routes by
path, so this works the same way as Decision 4.

**9. Errors** live in `model/error/change-request.error.ts`, each extending a `DomainError`
category:

- `ChangeRequestNotFoundError` (404)
- `ChangeRequestTargetNotFoundError` (404); a single read of a proposal whose target is gone still
  answers, with each field's `current` reported as `null`, so it can be rejected
- `EmptyChangeRequestError` (400)
- `ChangeRequestNotPendingError` (409)
- `NothingToChangeError` (422)
- `NotChangeRequestOwnerError` (403)

The existing `AirportNotFoundError` and city-not-found errors pass through the bus unchanged.

**10. Event.** `ChangeRequestWasDecidedEvent { changeRequestId, resource, targetId, status,
requestedById }` is added to `core/domain/events/dto/` and emitted after an accept or reject. It
has no listener yet; Discord notification is the planned consumer.

## Risks / Trade-offs

- **No foreign key on `targetId`** → orphaned proposals after a target is deleted. Mitigation: a
  404 on accept, and the list still shows the proposal so a reviewer can reject it. A cleanup
  listener on airport removal can come later.
- **Last write wins can silently overwrite a direct edit** → accepted by decision. The live diff on
  `GET user-data-change-request/:id` is the mitigation, and `appliedSnapshot` keeps what was overwritten.
- **Accept is not atomic across modules** → a crash between `apply` and the status write leaves an
  applied proposal still pending. Re-accepting is idempotent, so the reviewer just repeats it.
- **`payload` is JSON** → its shape is enforced only by the submit DTO. Each adapter must treat
  stored payloads as already validated and ignore any key outside its whitelist.
- **Cached airport reads** → if `GET airport/:id` is cached, an accepted change may not show
  immediately. The accept path must go through the same command the PATCH uses, so any existing
  cache invalidation applies. Verify this in the functional test.

## Migration Plan

This needs a new Prisma migration for the table and the two enums; it is additive only. The seed
gains fixture proposals in each status, with fixed random v4 UUIDs. Rollback means dropping the
table and the enums, because no existing data references them.
