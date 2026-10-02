## Why

Cabin crew are the people who notice wrong airport data on the ground — a misplaced
reference point, a wrong timezone, an airport filed under the wrong city — but only
operations can edit an airport, so those corrections are lost or arrive as chat messages.
Crew need a structured way to propose a fix that operations review before it takes effect.

Airports are only the first kind of data this applies to. Runways, terminals, parking
stands and gates will follow, so the review mechanism has to be one queue for every kind
of data from the start, not an airport-shaped feature that gets copied four times.

## What Changes

- **Cabin crew can propose an airport change.** A proposal names any combination of the
  airport's continent, name, country, timezone, location, shape and city (an existing
  city, chosen by id). It is validated like a direct edit, refused when it changes
  nothing, and stored as pending — the airport itself is untouched.
- **One review queue for all proposed data changes.** Operations and admins list
  proposals across every kind of data, oldest pending first, filterable by status and by
  kind. Opening one shows the current and the proposed value of every field it touches,
  read live so drift since submission is visible.
- **A proposal is decided as a whole.** A reviewer accepts it — the proposed values are
  applied at once, last write wins — or rejects it with a reason. A decided proposal can
  never be decided again. Accepting never changes the airport's data quality grade.
- **Crew keep track of their own proposals.** A crew member lists their proposals, optionally by status, with
  outcome and reason, and can withdraw one that is still pending.
- **The queue is extensible by kind of data.** Supporting runways, terminals, parking
  stands or gates later adds a way to propose that kind of change and nothing else: the
  queue, the review actions and their storage stay as they are.

## Capabilities

### New Capabilities

- `data-change-review`: proposing changes to curated reference data, the shared review
  queue, accepting, rejecting and withdrawing proposals; airports are the first kind of
  data it covers.

### Modified Capabilities

- `airport-data-curation`: an airport may now change through an accepted crew proposal,
  and such a change leaves the airport's data quality grade as it was.

## Impact

- New `change-requests` module (queue storage, review actions, one adapter per kind of
  data) and a new database table with its status and kind enums — a schema migration.
- `airports` module: gains a way to reassign an airport to an existing city by id, which
  the accept path uses; the existing operations edit endpoint is unchanged.
- New endpoints: proposing an airport change, the review queue (list, read, accept,
  reject), and the requester's own list and withdrawal. No existing endpoint changes.
- Seed: fixture proposals in each status for the functional suite.
