## Why

Cabin crew can already propose airport corrections into the shared review queue, but parking
stands are where they see wrong data most often: a contact stand recorded as remote, ground power
or pre-conditioned air missing, a stale noise curfew, a stand drawn in the wrong place. The queue
was built so that new kinds of data join it without a second mechanism; parking stands are the
first to do so.

## What Changes

- **Cabin crew can propose a parking stand change.** A proposal names any combination of the
  stand's name, terminal, jet bridge, stairs, deicing and its notes, ground power, pre-conditioned
  air, type, spot type, assistance, location category, noise sensitivity with its notes and time
  window, fueling options and coordinates. Each value is validated as for a direct edit; the
  terminal must be one of the stand's airport. The stand itself is untouched until accepted.
- **Stand proposals share the existing queue.** They appear in the review list, can be filtered
  by their kind, show current against proposed values, and are accepted, rejected and withdrawn by
  the existing actions. Accepting applies every proposed value at once, last write wins.
- **A stand never changes airport through a proposal.** The airport is not a proposable field.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `data-change-review`: parking stands become a supported kind of data, with their own way of
  proposing a change; the extensibility requirement now names airports and parking stands as
  supported.

## Impact

- `ChangeRequestResource` gains `parkingPosition` — a Postgres enum value migration.
- `change-requests` module: a parking stand adapter, its typed values, and one submit action.
- `airports` module: a query that reads a stand by its id alone and an assertion that a terminal
  belongs to an airport, both on the bus; the stand edit command is reused unchanged.
- Seed: stand proposals in each status, so existing queue and own-list feature bodies grow.
