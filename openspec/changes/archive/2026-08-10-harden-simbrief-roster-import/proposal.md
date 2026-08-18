## Why

SimBrief's JSON is a mechanical conversion of its XML flight plan, so a field's shape
depends on what the user filled in rather than on a schema. The `crew` block is the worst
offender: one flight attendant arrives as a bare string, several arrive as an array, an
index-keyed object turns up instead of an array, and an unfilled field arrives as `{}` or
as an empty string rather than being absent.

The import trusted the declared TypeScript shape (`fo: string`, `fa: string[]`). Whenever
reality diverged, the damage was silent and landed in the database: an unfilled purser
field created an operator crew member whose name was the string `[object Object]`, a
single flight attendant reported outside an array was dropped entirely, and the preliminary
loadsheet's cabin crew count was wrong in the same directions — inflated by the empty
object it counted as a purser, deflated by the attendants it never saw.

Nothing failed loudly, so a bad roster was only discovered by looking at the operator's
crew list afterwards, by which point the record already existed and the idempotency key
`(operatorId, role, name)` had pinned the wrong name in place.

## What Changes

- Read every crew field as "whatever shape it arrives in", resolving it to a list of
  names: a string yields itself trimmed, an array or a keyed object yields its entries
  resolved the same way, and anything else — including the empty object SimBrief sends for
  an unfilled field — yields nothing.
- Discard blank and whitespace-only names instead of importing them.
- Take the first name resolved for the single-valued roles (first officer, purser) and
  every name resolved for the flight attendants.
- Count the flight's cabin crew from the same resolved names, so the preliminary
  loadsheet's count matches the crew actually imported.
- No API or payload change: a plan whose crew block is well-formed imports exactly as
  before.

## Capabilities

### Modified Capabilities

- `operator-crew`: the SimBrief roster is read tolerantly rather than trusting the
  declared shape, and the flight's cabin crew count is derived from what the roster
  actually yields.

## Impact

- **Code**: `src/modules/flights/application/command/create-flight-from-simbrief.command.ts`
  gains one recursive resolver used by both the crew collection and the cabin crew count.
- **Data quality**: no more `[object Object]` or blank-named crew records, and no more
  attendants silently missing from a flight's manifest.
- **Behaviour**: a plan with no usable crew data imports the flight with no crew rather
  than with junk crew. Existing bad records are not cleaned up by this change.
- **Tests**: a colocated Jest spec covering each shape SimBrief has been observed to send.
- **Not affected**: the idempotency rule, the name title-casing, the email derivation, and
  the exclusion of the captain and the dispatcher.
