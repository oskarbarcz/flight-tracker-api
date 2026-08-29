# Design — city postcards

## Context

The commit immediately preceding this change (`Proper country code management`, #271)
built the arrival-driven collectible pipeline: `OnBlockWasReported` carries the
`landingAirportId`, `CountryVisitListener` guards on `captainId` and `completedAt`,
`StampCountryVisitCommand` resolves the airport's country over the bus and writes
`user_country_visit` with `createMany`/`skipDuplicates`, then busts the user's stats
caches. Postcards are the same pipeline one level of geography down, so most of this
design is about the three things that are genuinely new: giving a city an identity,
getting an image made and stored, and deciding who may look at it.

Two constraints shape the rest. Nothing external and slow may run near the flight
lifecycle — an `@OnEvent` listener swallows throws, so a failure there is invisible. And
the API must not grow storage credentials: `CLAUDE.md` states twice that the provider side
is an HTTP client and nothing else.

## Goals / Non-Goals

**Goals**

- One postcard per city, generated once, shared by every pilot who reaches that city.
- Cost bounded by the airport catalogue, not by pilots or flights.
- A pilot sees only what they have earned; images cannot be enumerated or guessed.
- Operations can inspect and repair bad art without a deployment.
- The visit ledger supports a count, so later milestone rewards need no new writes.

**Non-Goals**

- Any second reward type, or a shared award/reveal abstraction. One example is not enough
  to design an abstraction against, and postcards are unusual enough (globally shared art,
  external generation) that they may not generalise.
- Personalising the image. Art embedding a pilot's name or flight number would mean one
  image per pilot per city, multiplying both storage and generation by the user count. The
  client overlays personal detail — date, flight, "1st of 7" — over shared art.
- Live push of the reveal. The seen flag covers every client state; a WebSocket would only
  make the reveal marginally more immediate for a connected client.
- Metro-area curation. Fan-in is whatever the upstream city string says (see Risks).

## Decisions

### 1. City is an entity, deduplicated on name and country

`Airport.city` is free text from SkyLink. Hanging permanent, user-owned collectibles off a
mutable upstream string is the worst available option: one rename splits a collection in
half, silently. A `City` row with a uuid primary key and `@@unique([name, country])` gives
the postcard something stable to belong to, and reuses the ISO country codes #271 just
introduced.

An IATA city code (`LON`, `PAR`, `REK`) was considered as the natural key, since it is a
real standard that performs metro fan-in by definition. Rejected: the codes are not in the
SkyLink import and would have to be curated for every airport before anything worked,
which is a large amount of sourcing to buy a property — fan-in — that name matching
already delivers for the common cases.

### 2. The city's public identifier is a uuid, not a slug

A readable slug (`london-gb`) would be a convenient natural key but a poor public
identifier, because it makes the collection guessable: a pilot could reason their way to
postcards they have not earned. The uuid carries no information. Deduplication is the
unique constraint's job, not the identifier's.

### 3. The airport reports `city` as an object

`GetAirportResponse.country` is already a `CountryRef`; `city` is a bare string. Now that
a city has an id, leaving the two shaped differently would be a permanent asymmetry, and a
client with only a name cannot get from an airport to that city's postcard. `city` becomes
`{ id, name }`.

This is the change's only breaking read. Write DTOs are deliberately **not** changed:
`CreateAirportRequest` still names the city as a string, resolved find-or-create. Callers
that create airports are unaffected, and the ICAO import needs no new input.

### 4. The function generates and uploads; the API names the object and derives the URL

The generator holds the image-model credential and the Spaces credential; the API holds
neither and stores a string. The alternative — the function returns bytes and the API
uploads — would put storage credentials into the API for no gain.

The contract is fixed by the function:

```
GET <base>/city?city=<name>&uuid=<uuid>[&size=][&quality=][&format=]
    X-Require-Whisk-Auth: <secret>
200 → { city, uuid, model, size, quality, format, contentType, bytes,
        prompt, key, url }
```

`size` defaults to `1152x1536`, `quality` to `high`, `format` to `jpeg`. Both `city` and
`uuid` are required, and the API supplies both. The base URL carries the package, as the
OSM and AeroLOPA base URLs do, and the client appends `/city`.

**The 200 body cannot be relied on.** Generating at the default size and quality exceeds
the platform's synchronous response window: a real call ran for 40 seconds and returned
`202` with `{"error": "Response not yet ready."}` and no payload. A 202 is therefore an
ordinary outcome of a successful generation, not an error.

The resolution follows from the API naming the object: because the API chose the `uuid` and
the `format`, it already knows the key — `postcards/<uuid>.<jpg|png>` — and can construct
the URL without being told. So the API derives the expected location up front, treats a
`200` as confirmation that the art landed, and treats a `202` as "probably landed, not yet
confirmed". Confirmation is a cheap request for the object itself; until it succeeds, the
postcard stays without art and is retried. This makes generation idempotent by
construction: retrying with the same uuid targets the same key.

**What is sent as `city` is the city name, a space, then its country.** There is no country
parameter, so the only way to tell Paris in France from Paris in Texas is to put both in the
one string. A space is the separator: a comma is not in the accepted character set.

The country cannot be appended blindly. Accented Latin letters are accepted — `Zürich`,
`Malmö`, `Côte d'Ivoire` all pass — but `&` and parentheses are not, and the whole string is
capped at five words. So several catalogue country names would make an otherwise valid request
permanently invalid: `Antigua & Barbuda` and `Myanmar (Burma)` on characters, `Democratic
Republic of the Congo` on the word count. The country is therefore normalised, and where it
still will not fit, **the city is sent alone**. Losing the disambiguation is a far better
outcome than losing the art, since a rejected request can never succeed on retry.

Errors come in two shapes, and the client must tell them apart. The function answers
`{ error: { code, message, status } }`; a rejected secret is refused by the platform
before the function runs, with `{ code, error }` and a `401`. A `BAD_REQUEST` is permanent
and must never be retried — the inputs will not become valid. Anything else is treated as
transient.

Types are hand-written against a vendored contract file, with no codegen and no drift
gate, exactly as AeroLOPA and OSM do.

### 5. The object is named by a dedicated random uuid, never by a city or postcard id

The function takes the object name as an input, so the art URL is fully derivable from that
uuid. Which uuid the API sends therefore decides whether the collection is peekable, and two
tempting choices are wrong:

- **The city id must not be used.** An airport reports its city as `{ id, name }`, so every
  authenticated pilot can read a city id for an airport they have never flown to. If the art
  were named by it, constructing the URL for an unearned postcard would be trivial and the
  earned-only rule would be decorative.
- **The postcard id must not be used either.** It is exposed to holders, which is harmless
  in itself, but it is fixed for the life of the postcard — so regenerating would overwrite
  the same key, leaving the URL unchanged and the CDN serving the old art (see decision 8).

So the postcard carries a separate art uuid, generated fresh for each production and stored
alongside the derived key. It is never returned to a pilot except as part of the art URL of a
postcard they hold.

The bucket stays public. Unguessable names give enumeration resistance without anyone holding
a signing key, and keep the CDN in front of every read; the authorization that matters is at
the API, which hands out a URL only for a postcard the pilot has earned. A leaked URL exposes
one city's art, an acceptable loss for a collectible.

Private-bucket signed URLs were rejected because signing requires a storage credential
somewhere and defeats CDN caching. Proxying bytes through the API was rejected because it
burns API bandwidth on every image view.

### 6. Generation is pre-warmed on city creation

A city row appears only because an airport was imported — deliberate and rare. Generating
then, in the background, means the postcard is ready long before anyone flies there, no
external call ever runs inside a flight-lifecycle listener, and a generation failure
surfaces at import time rather than at a pilot's celebration.

### 7. An award does not wait for art

Pre-warming is the normal path but cannot be the only one: the seeded cities predate the
capability, and generation can fail. So the award is a database write only — recorded the
moment the pilot qualifies, whatever state the art is in. A postcard carries a status, and
a pilot may hold one whose image is still pending. This keeps the collection count honest
and keeps the award path free of any external dependency.

### 8. Regeneration mints a new art uuid, and the old object is left behind

Operations can order a postcard's art produced again. It is produced under a **new** art
uuid, so it lands at a new URL. That is what makes the replacement visible: the old URL is
already in CDN caches and in any client that stored it, and the API cannot purge either
without a storage credential. A new URL sidesteps both.

The cost is an orphan: the contract has no delete operation, so the replaced object stays in
the bucket unreferenced. This is accepted. Regeneration is an operations-only repair reached
by a deliberate action on a single card, so orphans accrue at the rate someone chooses to
press the button — roughly 300 KB each, against a base tier of 250 GiB. A delete operation on
the function would remove even that, but nothing here waits on it.

Everyone holding the postcard sees the new art; that is the point of the endpoint. `seenAt`
is **not** reset, because the pilot already had their moment and repairing art must not
manufacture a second celebration. A postcard already producing art cannot be asked to
produce it again.

Regeneration takes no parameters at all. The city, its country and its continent are facts
the system already holds, and the proportions, fidelity and format are fixed so that every
postcard is drawn alike — none of them is a caller's to choose. Replacing art is therefore
one decision rather than a form.

### 9. Cities are in `airports`; visits are in `statistics`; postcards are in `game`

City is airport geography — it arrives with the ICAO import, and `airport.cityId` is a
local foreign key, so keeping it in `airports` avoids a bus hop on the import path. It is
asymmetric with `countries`, which is a module of its own, but countries are static JSON
with no table and no importer.

The visit ledger sits beside `user_country_visit` in `statistics`, because a visit count is
a statistic and its twin already lives there. `game` owns the collectible and reads visits
over the bus.

### 10. A pilot sees earned postcards and a total; operations see everything

The collection is a set of holes to fill. Revealing unearned cities by name would turn it
into a destination catalogue and spend the surprise. A total count keeps progress legible
("12 of 40") without disclosing what is missing.

Operations are the exception, and need to be: art cannot be judged bad without being
looked at. The operations read is separate from the pilot read rather than the same
endpoint with a role branch, so the pilot's read has no code path that can leak an
unearned image.

### 11. Concrete parameters

| Parameter           | Value                                      | Note                                    |
| ------------------- | ------------------------------------------ | --------------------------------------- |
| Postcards per city  | 1                                          | The whole basis of the cost model       |
| Who is awarded      | The flight's captain                       | Mirrors `user_country_visit`            |
| Award trigger       | `OnBlockWasReported`                       | Landing airport, so diversions are free |
| Visit uniqueness    | One row per pilot per flight               | Mirrors `user_country_visit`            |
| Postcard uniqueness | One row per city                           | Enforced; the generation claim          |
| Generation trigger  | City creation, background                  | Regeneration is operations-only         |
| Object name         | A dedicated art uuid, fresh per production | Not the city id; see decision 5         |
| Default art         | `1152x1536`, `high`, `jpeg`                | The function's own defaults             |
| Reveal              | `seenAt` on the award                      | Set by an explicit acknowledgement      |
| Pilot visibility    | Earned only, plus a total count            | Operations see all                      |

## Risks / Trade-offs

**Omitting `uuid` burns a generation instead of failing fast.** A call with `city` and no
`uuid` does not answer `400` — it runs the full generation and hits the 202 window, as does a
malformed one. Every other parameter validates instantly. This is accepted rather than fixed:
the API sends a uuid it generated itself on every call, so the path is unreachable in practice.
The consequence is only that a future bug in that one parameter would be expensive rather than
loud.

**A successful generation usually will not answer 200.** At the default size and quality the
work outlives the platform's synchronous window, so 202 is the normal outcome and the API
must confirm the object separately (decision 4). Any timeout tuning on the client is about
how long to wait for a _confirmation_, not for the image.

**Regenerated art is orphaned.** The contract has no delete, so every repair leaves an
unreferenced object behind. Cheap per occurrence, unbounded over time.

**A city the function will not draw has no art and no repair.** The `city` parameter accepts
only Latin letters, digits, spaces, apostrophes and dots, at most 64 characters and 5 words.
A city imported with a name in another script fails validation permanently — retrying cannot
help, and with regeneration taking no parameters there is no way to draw it under another
name. Such a city keeps a postcard without art; what it does now carry is the reason, which
operations can read rather than guess at.

**Metro fan-in is inherited, not curated.** With `unique(name, country)`, grouping is
decided by whatever the upstream calls each airport's city. The London fields all say
"London" and collapse to one city; Keflavík and Reykjavík city airport both say
"Reykjavik" and collapse. But Newark says "Newark" and will be a different city from New
York. This is silent either way — nobody is told a city split — and accepting it is the
price of not curating IATA city codes.

**The dedup path has no coverage today.** The ten seeded airports sit in ten distinct
cities, so find-or-create never finds. A second airport in an already-seeded city is added
to the seed specifically so the branch is exercised.

**The airport `city` change is wider than it looks.** `deep-compare` matches on exact key
count, so every full airport body assertion in the functional suite breaks, along with the
desktop application's string read.

**Regenerated art changes under pilots who already hold it.** Intentional, but it means a
postcard is not immutable once awarded. Anyone who screenshots or caches art client-side
may see it change. Acceptable: the alternative is unrepairable bad art.

**Cost is bounded but not zero.** Storage stays on the Spaces base tier at any plausible
city count. The real spend is image generation, one per city, and pre-warming means paying
for cities nobody visits. At ten cities this is noise; it scales with the airport
catalogue, so a large import would be a deliberate spend.

## Migration Plan

The migration follows the shape of the country-code migration in the working tree, which
maps values, guards that everything mapped, then narrows the column.

1. Create `city`, `postcard`, `user_postcard`, `user_city_visit` and the postcard status
   enum. Add `airport.cityId`, nullable.
2. Insert one `city` row per distinct `(city, country)` pair found in `airport`.
3. Point every `airport.cityId` at its city.
4. Raise if any airport is left without a city, so a bad state fails the migration rather
   than reaching production.
5. Make `airport.cityId` required and drop `airport.city`.
6. Backfill `user_city_visit` from completed flights, deriving each from the flight's
   captain, its completion time and the airport it landed at — the diversion airport where
   one was declared — exactly as the country stamp backfill does.

Postcards are **not** backfilled by the migration: they need an external call, and a
migration writing raw SQL cannot ask for one. This is the one place where pre-warming on city
creation does not reach — `CityWasCreatedEvent` is emitted by the airport commands, so cities
that arrive through a migration announce themselves to nothing and would sit without art
indefinitely, invisible to the operations catalogue because they have no postcard row at all.

So an operations user draws them, once, after deploying: an endpoint finds every city with no
postcard, every postcard whose art was never drawn, and every postcard whose drawing failed,
and queues each through the same listener a genuinely new city goes through. Cities already
holding art are skipped, so it is safe to call again, and a drawing already in flight is not
started a second time.

Because a single drawing can outlive a request, the endpoint marks each city as being drawn
and answers with what it queued rather than waiting for the art. That makes the response
authoritative — a second call sees the work in flight — at the cost of the art itself arriving
later.

Seeded cities get postcard rows from the seed pointing at committed sample images, bar one
that is deliberately left without art so the awaiting-art state and this sweep both have a
fixture.

## Open Questions

- Should a repeated visit to a city the pilot already holds do anything at all? The count is
  recorded but nothing surfaces it. Milestone editions are the obvious later use.
- Does the desktop application's airport read change ship in the same release as this one, or
  does it need `city` served both ways for one version?
