## Context

See `proposal.md` § Why for motivation and `specs/operator-crew/spec.md` for the behaviour
contract.

Three pieces of current state shape the approach:

**The provider types are aspirational.** `src/core/provider/simbrief/type/simbrief.types.ts`
declares `Crew` as `{ cpt: string; fo: string; pu: string; fa: string[]; ... }`. The client
casts the parsed JSON to that type without validating it, so the compiler's confidence in
those shapes is unearned — which is why `EmptyElement = Record<string, never>` already
exists in the same file for the fields where the mismatch was noticed earlier.

**One roster feeds two outputs.** The `crew` block is read twice in
`create-flight-from-simbrief.command.ts`: once to build the crew members that are imported
and linked, and once to count the cabin crew recorded on the flight's preliminary
loadsheet. The two readings had drifted — the collection filtered falsy `fa` entries, the
count did not filter at all — so a plan could import two attendants and report three.

**Bad names are sticky.** Crew import is idempotent on `(operatorId, role, name)`. A
junk name is therefore not a transient error: it becomes a permanent operator crew record
that every later import of the same roster matches against and leaves in place.

## Goals / Non-Goals

**Goals:**

- Import what the plan actually says, for every shape SimBrief has been observed to send.
- Keep one reading of the roster behind both the imported crew and the cabin crew count.
- Fail towards "no crew member" rather than towards "a crew member with a junk name".

**Non-Goals:**

- Validating the SimBrief payload at the provider boundary. The types stay declarative
  and the tolerance lives at the point of use; a schema validator over the whole OFP is a
  larger change than this problem justifies.
- Rejecting a flight import because its crew block is unusable. The flight plan is the
  valuable part; missing crew is a lesser loss than a failed import, and operations can
  build the manifest by hand.
- Cleaning up crew records already imported with junk names.
- Touching the captain or the dispatcher, which are still deliberately not imported.

## Decisions

### One recursive resolver, `toCrewNames(value: unknown): string[]`

A single private method takes `unknown` and returns the names it can find: a string yields
itself trimmed (or nothing when blank), an array yields the flat-mapped resolution of its
entries, a non-null object yields the flat-mapped resolution of its values, and everything
else yields nothing.

_Why:_ every observed malformation is one of those four cases, and recursion covers the
combinations — an array containing an empty object, a keyed object of strings, a keyed
object whose values are arrays. The alternative, a branch per field per observed shape,
grows with each new surprise from the provider and would let the collection and the count
drift again.

_Why `unknown` rather than the declared type:_ typing the parameter as `string | string[]`
would force a cast at each call site and re-assert exactly the confidence that caused the
bug. `unknown` states the truth — the shape is not known until it is examined.

_Consequence:_ a keyed object is treated as a collection of names, so SimBrief's
index-keyed `fa` (`{"0": "…", "1": "…"}`) imports as two attendants rather than being
dropped.

### Single-valued roles take the first name resolved

`const [firstOfficer] = this.toCrewNames(crew.fo)` and the same for the purser; a resolved
list that is empty leaves the role unfilled.

_Why:_ the resolver returns a list for every input, and a flight has exactly one first
officer and one purser. Taking the head is the narrowest way to reuse one resolver for
both the single-valued and the multi-valued roles, and it degrades sensibly if SimBrief
ever sends two.

### The cabin crew count is derived from the same resolved names

`pursers + this.toCrewNames(crew.fa).length`, where `pursers` is 1 when the purser resolves
to a name and 0 otherwise.

_Why:_ the count exists to describe the crew on board, and the crew on board is now
exactly what the resolver yields. Deriving both from one function makes the loadsheet count
and the imported manifest agree by construction rather than by two matching filters.

### The tolerance lives in the command, not in the provider client

`SimbriefClient` keeps returning the parsed payload as `OperationalFlightPlan`.

_Why:_ the client's job is transport and provider-level failure handling. The knowledge
that "an unfilled crew field can arrive as an empty object" is import knowledge, and the
import is the only consumer of the crew block. Pushing it into the client would put
domain-shaped normalisation behind the provider boundary for one caller.

## Risks / Trade-offs

**A silent import is still silent** → a plan whose crew block is entirely unusable imports
a flight with no crew and no warning. Accepted: the previous behaviour was worse (junk
records), and the flight's crew list makes the absence visible to operations.

**Keyed objects are assumed to be collections** → if SimBrief ever sends a crew entry as
an object of _attributes_ (`{name: "…", rank: "…"}`), the resolver would import both values
as names. No such shape has been observed, and the alternative — an allow-list of keys —
would fail closed on the index-keyed shape that does occur.

**The declared provider types still lie** → `Crew.fa` remains `string[]` even though the
import no longer believes it. Left as is deliberately: correcting the types to unions would
ripple through every consumer of the OFP without changing behaviour.

## Migration Plan

None. No schema, no payload, no configuration; the change is confined to how one command
reads a provider response. Reverting restores the previous parsing, and any crew records
imported in the meantime remain valid.
