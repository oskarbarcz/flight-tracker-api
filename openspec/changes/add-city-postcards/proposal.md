## Why

Pilots already collect passport stamps, but a country is a coarse trophy. A pilot who
flies Frankfurt–Paris twenty times holds one French stamp and has nothing at all to show
for Paris. Stamps are also a row in a list: a date and a count, nothing to look at.

Postcards are the finer-grained, visual half of the same idea — **one collectible image
per city, awarded the first time a pilot lands there**. Because a postcard belongs to the
city rather than to the pilot, the art is generated once and every pilot who ever reaches
that city receives the same card. That single decision is what makes the feature cheap:
the image spend is bounded by the size of the airport catalogue, not by how many pilots
fly or how often. Ten cities exist today.

It also opens `game`, a module for the things that give a pilot something nice rather
than something operational. Postcards are its first inhabitant and will not be its last.

## What Changes

- **A city becomes a thing.** `Airport.city` is free text imported from SkyLink, which is
  no basis for a permanent user-owned collectible — a rename upstream would silently
  split someone's collection. A `City` entity is introduced in the `airports` module,
  unique on name and country, populated find-or-create as airports are imported.
- **City visits are recorded**, in `statistics`, next to the country visits they mirror:
  one row per pilot per flight, so the visit count comes for free and the first visit is
  identifiable. A pilot can read their visited cities with counts and first/last dates.
- **Postcards live in a new `game` module.** One postcard per city, awarded to the
  flight's captain on their first landing there. A pilot reads only the postcards they
  have earned, plus a count of how many exist in total — the collection is a set of holes
  to fill, not a browsable catalogue.
- **Art is generated externally and stored externally.** The `postcard-generator`
  DigitalOcean Function draws the image _and_ uploads it to Spaces; the API names the city
  and its country so a city is not confused with a same-named city elsewhere, stores the
  resulting location and holds no storage credentials, exactly as the AeroLOPA and OSM provider
  clients hold none. The API names the object, with a value dedicated to that production —
  never the city identifier, which every pilot can read from any airport — so postcard
  images cannot be enumerated or guessed by a pilot who has not earned them. Because a
  generation at full quality outlives the platform's synchronous response window and
  usually answers with no payload, the API derives the location it asked for and confirms
  the stored image rather than waiting to be told.
- **Generation is pre-warmed, not lazy.** A city row only exists because an airport was
  imported — a deliberate, curated act — so the image is generated then, in the
  background, and is ready long before anyone flies there. Nothing slow ever runs near
  the flight lifecycle.
- **Operations can inspect and repair the art.** Generated images will sometimes be
  wrong, ugly or embarrassing. Operations users can view every postcard regardless of who
  has earned it, and can order any one of them regenerated — optionally overriding the name
  to draw, which is the only repair for a city whose name the generator will not accept.
  Regeneration replaces the art for everyone holding that postcard, at a new location so no
  cache serves the old image, and without re-triggering anyone's reveal.
- **A pilot's first sight of a new postcard is marked.** Each award records whether it has
  been seen, so the client can play its reveal exactly once even if the pilot was not
  looking at the application when the flight landed.

**One breaking read change:** an airport reports its city as an object with an id and a
name, matching how it already reports its country. Every consumer reading `airport.city`
as a string is affected. Airport write requests are unchanged — they still name the city
as a string, and it is resolved find-or-create.

## Capabilities

### New Capabilities

- `city-catalogue`: the city as an identified record, how a city is deduplicated, how one
  comes into existence as airports are imported, and how an airport reports the city it
  belongs to.
- `user-city-visits`: recording which city a pilot landed in on each flight, the visit
  count that follows from it, and the pilot's own read of the cities they have visited.
- `city-postcards`: the postcard as a per-city collectible — its generation and storage,
  the award on a pilot's first visit, what a pilot may and may not see, the reveal being
  marked as seen, and the operations views that inspect and regenerate the art.

### Modified Capabilities

- _None._ `user-country-passport` is untouched: countries and cities are recorded from the
  same arrival independently, and nothing about a stamp changes. No existing capability
  documents the airport response shape, so the `city` field change modifies no spec.

## Impact

- **`airports` module:** new `City` model, `CitiesRepository` and a find-or-create used by
  airport creation and by `ImportAirportByIcaoCommand`
  (`import-airport-by-icao.command.ts:102`). `GetAirportResponse.city` becomes a
  `CityRef`, which touches `airport.model.ts:94` and the `city: true` selection in
  `airports.repository.ts:31`. A `CityWasCreatedEvent` is emitted for the generator to
  react to.
- **`statistics` module:** new `UserCityVisitRepository`, a `CityVisitListener` on
  `OnBlockWasReported` alongside the existing `CountryVisitListener`, a
  `RecordCityVisitCommand`, and a get-my-cities query and action mirroring
  `get-my-countries`. New `CACHE_KEYS.STATS_CITIES`, added to the user-stats bust list
  and busted on every recorded visit.
- **New `game` module:** flat, with a concern folder under each layer —
  `game/application/command/postcard/`, `game/application/query/postcard/`,
  `game/application/event/`, `game/infra/database/postcard/`,
  `game/infra/http/action/postcard/`, `game/model/postcard/`. A pilot's own collection answers under `/api/v1/user/me/postcard`, tagged `my postcards`; the operations surface answers under `/api/v1/postcard`, tagged `postcard`. Holds the award, the pilot
  read, the seen acknowledgement, and the two operations actions.
- **`core/provider/postcard`:** a new HTTP client for the `postcard-generator` function,
  following `AerolopaClient` — `fetchWithRetry`, the `X-Require-Whisk-Auth` secret,
  hand-written types mirroring a vendored contract, and typed errors separating a permanent
  rejected request from one transient unavailable error. `POSTCARD_FUNCTION_BASE_URL`,
  `POSTCARD_FUNCTION_SECRET` and the public art base URL in `.env.dist`.
- **Prisma schema and migration:** new `city`, `postcard` and `user_postcard` tables and a
  postcard status enum; `user_city_visit` mirroring `user_country_visit`;
  `airport.cityId` added and `airport.city` dropped. The migration backfills distinct
  `(city, country)` pairs into `city` and guards that every airport mapped, the way the
  country-code migration guards its own mapping.
- **Seed:** a `cities.seed.ts` resource, postcard rows for the seeded cities pointing at
  committed sample images, and a second airport in an already-seeded city so the
  find-or-create path has coverage — today's ten airports sit in ten distinct cities and
  never exercise it.
- **Mocks:** `docker/mock/functions/postcard.json`, picked up by the existing
  `functions-mock` container's glob. No new container.
- **Functional tests:** one feature file per new endpoint with admin, cabin-crew and
  unauthorized actors; the award side effect extends the existing on-block report
  feature; every airport body assertion in the suite is updated for the `city` shape.
- **Companion repositories (not in this change):** the desktop application reads
  `airport.city` as a string and must be updated; the `postcard-generator` function needs
  its contract implemented and its Spaces upload wired.
- **Explicitly out of scope:** any second reward type. Postcards are built concrete; a
  shared award-and-reveal spine is worth extracting only once there is a second example
  to extract it from.
