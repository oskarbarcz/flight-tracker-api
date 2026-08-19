## Context

See `proposal.md` § Why for motivation and
`specs/simbrief-account-verification/spec.md` for the behaviour contract.

Four pieces of current state shape the approach:

**SimBrief has no account endpoint.** The only public route is
`api/xml.fetcher.php?userid=…&json=2`, which returns the most recent flight plan generated
on an account. "Does this account exist" is therefore answered by asking for a plan and
reading how the request fails.

**SimBrief signals an unknown user in two ways.** It answers `400`, and it also answers
`200` with a payload whose `fetch.status` reads `unknown userid`. A client that only checks
`response.ok` sees the second as a valid plan and hands a body with no route or aircraft to
its caller.

**The client had one failure mode.** `getOperationalFlightPlan` wrapped everything in a
`try`, logged, and rethrew, so callers could not distinguish a wrong ID from an outage —
which is exactly the distinction a user-facing check needs.

**Profile validation already has an assert-query precedent.** `UpdateOwnProfileHandler`
validates the home airport by dispatching `AssertAirportExistsQuery` on the bus, so an
external precondition on a profile field has an established shape to follow.

## Goals / Non-Goals

**Goals:**

- Let a pilot confirm the ID is theirs by recognising the flight plan behind it.
- Separate "no such account" from "provider unavailable" once, in the client, for every
  caller.
- Reject a wrong ID at the moment it is saved, not at the moment a flight import needs it.
- Never let a SimBrief outage block a profile edit.

**Non-Goals:**

- Proving the pilot _owns_ the account. SimBrief's fetch route is public and exposes the
  latest plan of any user ID, so the check confirms the account exists, not that it is
  theirs. Showing the plan back is what lets the pilot recognise it.
- Re-verifying IDs already stored, or verifying on read.
- Caching the lookup. It is a deliberate user-initiated check whose whole point is to be
  current.
- Replacing the flight import's own error handling beyond the taxonomy the client now
  provides.

## Decisions

### The client grows `findOperationalFlightPlan`, returning null for an unknown user

`findOperationalFlightPlan(userId)` answers a plan, or `null` when SimBrief reports the user
as unknown (`400`, or a payload whose `fetch.status` contains `unknown userid`), and throws
`SimbriefUnavailableError` when the request fails, the body is unparseable, or the status is
neither empty nor `success`. `getOperationalFlightPlan` becomes a thin wrapper that turns
the null into `SimbriefUserNotFoundError`.

_Why:_ "not found" is an expected answer for a lookup and an exception for an import. A
nullable finder plus a throwing getter gives each caller the shape it wants without either
having to catch and re-interpret the other's errors — the same `findOneBy` / `findById`
split the repositories already use.

_Why check the payload status as well as the HTTP status:_ because SimBrief's `200`
`unknown userid` response would otherwise be read as a plan, and the caller would report an
account that does not exist.

_Consequence:_ the flight import now fails with a typed 404 or 502 instead of a generic
error, which is a strict improvement and needed no change at its call site.

### Two provider-level errors, one of them the only 5xx category

`SimbriefUserNotFoundError extends NotFoundError` (404) and
`SimbriefUnavailableError extends BadGatewayError` (502), both declared next to the client.

_Why:_ the distinction is a property of the provider, not of any one feature, so it belongs
at the provider boundary where every caller inherits it. `BadGatewayError` is the codebase's
one non-4xx domain category and exists for exactly this — an upstream that did not answer.

### The endpoint returns the latest plan, not a bare boolean

`GET /api/v1/user/simbrief/{simbriefUserId}` answers `SimbriefAccount` with the ID and the
plan's callsign, origin, destination, aircraft, scheduled off-block and on-block times, and
generation time.

_Why:_ the ID cannot be validated in any deeper sense than "SimBrief knows it" (see
Non-Goals), so the check is only useful if the pilot can recognise the account. A flight
they generated, with a date, is recognisable; `{"valid": true}` is not.

_Why it sits under `/api/v1/user/simbrief/…` rather than under `/me`:_ it resolves an ID the
caller is holding, not an attribute of their account — nothing is read from or written to
the signed-in user. Authentication is still required, so the route is not a public proxy to
SimBrief.

### Empty fields are normalised to null, and the ID is URL-encoded

Text values are read through a helper that returns null for a non-string, blank, or
empty-element value; timestamps are read from SimBrief's unix seconds and returned as
absent when unparseable; the ID is `encodeURIComponent`-ed into the query string.

_Why:_ SimBrief renders an unfilled XML element as `{}`, so an unnormalised passthrough puts
an empty object where the API's own contract promises a string or null. The encoding closes
a query-injection seam now that the ID reaching the client comes straight from a URL path
segment.

### Verification on save is an assert query that fails open

`UpdateOwnProfileHandler` dispatches `AssertSimbriefUserExistsQuery` when the patch carries
a non-empty ID. The handler throws `InvalidSimbriefUserIdError` (400) when SimBrief reports
the account as unknown, and returns — logging a warning — when the lookup itself fails.

_Why fail open:_ the alternative couples every profile edit to SimBrief's availability. A
pilot changing their name during a SimBrief outage would be blocked by a check on a field
they did not touch, and the value being stored is still well-formed digits. Failing closed
would trade a rare bad value for a common outright block.

_Why 400 rather than 404 or 422:_ the offending value came from the request body, and the
message names the account rather than the field — a validation failure about the payload,
consistent with the pipe's own 400s, and not to be confused with "this profile does not
exist".

_Why skip verification when clearing:_ a null or empty ID removes the link and needs no
provider round trip.

### A digits-only pattern in front of the lookup

`@Matches(/^\d+$/)` on `simbriefUserId` in `UpdateOwnProfileDto`.

_Why:_ SimBrief user IDs are numeric, so a value with letters is wrong regardless of what
SimBrief would say, and rejecting it in the pipe keeps an obviously bad request from
reaching the provider. It also gives the caller the standard `violations` map rather than a
message about a remote account.

## Risks / Trade-offs

**An unverified ID can still be stored** → when SimBrief is unreachable, a wrong ID is
accepted and the pilot only learns of it at the next import. Deliberate, per the fail-open
decision; the warning log records every instance.

**The check confirms existence, not ownership** → a pilot could store somebody else's ID
and import their flight plans. That is inherent to SimBrief's public fetch route and
predates this change; the endpoint at least makes the account visible, so storing a stranger's
ID becomes a deliberate act rather than an accident.

**One extra outbound call per profile save** → only when the patch carries an ID, and only
for the write path. Reads are untouched.

**A behaviour change for existing callers** → an ID SimBrief does not know is now rejected on
save. Intended: the previous acceptance was the bug.

## Migration Plan

1. Extend `SimbriefClient` with the finder, the status parsing and the two errors, and add
   `fetch`, `iata_code`, `name` and `icaocode` to the provider types.
2. Add the account model, the verify query, the assert query and the action, and register
   them in `UsersModule`.
3. Wire the assert into `UpdateOwnProfileHandler` and add the pattern to the DTO.
4. Add the `987654` (known) and `999999` (unknown) fixtures to `docker/mock/simbrief.json`
   and restart the `simbrief-mock` container so the mockserver reloads them.
5. Reorganise `features/user/` into per-concern directories with `git mv`, so the diff stays
   a rename.

**Rollback:** removing the assert and the action restores the previous behaviour; no schema
or stored data is involved, and the client's split is behaviour-compatible with its previous
single method.
