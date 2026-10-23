## Context

The timesheet is stored as a JSON column. Prisma cannot order by a path inside JSON, and the codebase
has no raw SQL.

## Decisions

### Order timesheet fields in memory, then load one page

For a timesheet sort the repository reads only `id`, `createdAt` and `timesheet` for every flight the
filters match, orders them with a pure comparator, slices the requested page and loads the full rows
for those ids. Creation order stays in the database query as before.

_Why:_ it keeps Prisma as the only database client and the comparator testable on its own. The extra
read is three small columns per matching flight, which suits the size of a simmer's operation. If the
table outgrows it, the next step is raw SQL ordering on the JSON path, or stored block-time columns.

### Missing times come last in both directions

A flight that has not reached on-block has no actual on-block time. Placing it last in either
direction keeps "the flight that arrived last" a single-row query.
