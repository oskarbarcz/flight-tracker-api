<!--
Each group is an independent, individually shippable unit (one GitHub issue). Every group
carries its own schema/migration/client-regen work; there is no shared "foundations"
group. Group 7 is the Definition of Done applied inside every group, not a separate issue.

Ordering constraints worth stating once. Group 1 must ship first: nothing else has a city
to hang off. Group 3 is independent of 1 and 2 and can be built in parallel. Group 4 needs
1, 2 and 3. Groups 5 and 6 need 4.

The generator contract is fixed and the function is live. Two of its behaviours drive the
client design and must not be designed around silently: a successful generation usually
answers 202 with no payload because the work outlives the platform's synchronous window, so
the art location is derived from the uuid the API sends rather than read from the response;
and a BAD_REQUEST is permanent, so it must never be retried. Accented Latin letters are
accepted; `&` and parentheses are not, and the whole `city` string is capped at five words —
which is why the country is normalised and dropped rather than sent blindly.
-->

## 1. City catalogue (ships first)

- [x] 1.1 Add a `City` model to `schema.prisma` with a uuid primary key, `name`, `country` as a two-letter code, and `@@unique([name, country])`; add `Airport.cityId` and the relation
- [x] 1.2 Write the migration: create `city`, insert one row per distinct `(city, country)` pair from `airport`, point every `airport.cityId` at its city, `RAISE EXCEPTION` if any airport is left unplaced, then make `cityId` required and drop `airport.city` — following the shape of the country-code migration
- [x] 1.3 Regenerate the Prisma client to `prisma/client/`
- [x] 1.4 Add `CitiesRepository` under `airports/infra/database/` with a find-or-create by name and country
- [x] 1.5 Replace `city` with `cityId` resolution in airport creation and in `ImportAirportByIcaoCommand.toRequest()` (`import-airport-by-icao.command.ts:102`), keeping `CreateAirportRequest.city` a string so no caller changes
- [x] 1.6 Add a `CityRef` model and change `GetAirportResponse.city` from a string to `CityRef` (`airport.model.ts:94`); update the `city: true` selection in `airports.repository.ts:31` to select the relation
- [x] 1.7 Emit `CityWasCreatedEvent` when a city is created, carrying the city's id, name and country
- [x] 1.8 Add `prisma/seed/resource/cities.seed.ts`, wire it into `loadResources()`, and point the seeded airports at their cities
- [x] 1.9 Add a second seeded airport in an already-seeded city so the find-or-create path is exercised — today's ten airports sit in ten distinct cities and never find
- [x] 1.10 Update every airport body assertion in the functional suite for the `CityRef` shape; `deep-compare` matches on exact key count, so all of them break
- [x] 1.11 Cover the catalogue behaviour: two airports in one city sharing it, the same name in two countries being two cities, an import creating its city, and an airport read reporting an identifier and a name

## 2. City visits and the pilot read (needs 1)

- [x] 2.1 Add `UserCityVisit` to `schema.prisma` mirroring `UserCountryVisit` — `userId`, `cityId`, `flightId`, `airportId`, `visitedAt`, `@@unique([userId, flightId])`, `@@index([userId, cityId])` — and migrate
- [x] 2.2 Add `UserCityVisitRepository` under `statistics/infra/database/`, with a `record` using `createMany`/`skipDuplicates` and a summarize-by-city returning visits, first and last visit
- [x] 2.3 Add `RecordCityVisitCommand` resolving the landing airport's city over the bus, mirroring `StampCountryVisitCommand`
- [x] 2.4 Add `CityVisitListener` on `OnBlockWasReported` beside `CountryVisitListener`, guarding on `captainId` and `completedAt`
- [x] 2.5 Add `CACHE_KEYS.STATS_CITIES`, include it in the user-stats bust list in `cache.key.ts`, and bust it from `RecordCityVisitCommand`
- [x] 2.6 Add the get-my-cities query and action mirroring `get-my-countries`, ordered by first visit oldest first, empty list for a pilot who has never flown
- [x] 2.7 Register the listener, command handler, query handler and repository in `StatisticsModule`, and the action in its controllers
- [x] 2.8 Extend the migration in 2.1 to backfill visits from completed flights, deriving each from the captain, the completion time and the landing airport — the diversion airport where one was declared
- [x] 2.9 Seed city visits consistent with the seeded flights, so the read has fixtures without driving the lifecycle
- [x] 2.10 Add the visited-cities feature file with admin, cabin-crew and unauthorized actors, and extend the existing on-block report feature with the visit side effect

## 3. Postcard generator provider client (independent)

- [x] 3.1 Vendor the generator contract as `postcard.openapi.json` under `core/provider/postcard/` and hand-write `type/postcard.types.ts` against it, comment-free, as AeroLOPA and OSM do
- [x] 3.2 Add `PostcardClient` following `AerolopaClient`: `fetchWithRetry`, the `X-Require-Whisk-Auth` secret, and a `generate({ city, uuid, size?, quality?, format? })` calling `GET <base>/city`
- [x] 3.3 Derive the expected key as `postcards/<uuid>.<jpg|png>` from the uuid and format the client sent, so the caller knows the location without reading it from the response
- [x] 3.4 Treat `202` as accepted-but-unconfirmed rather than an error, returning that outcome distinctly from a confirmed `200`
- [x] 3.5 Add a confirmation call that checks the stored object exists, so art is only ever recorded once it can be served
- [x] 3.6 Map the two error shapes: the function's `{ error: { code, message, status } }` and the platform's `{ code, error }` for a secret rejected before the function runs
- [x] 3.7 Add typed errors under `error/postcard.error.ts`, distinguishing a permanent `BAD_REQUEST` — which must never be retried — from one transient unavailable error covering a rejected secret, a timeout and an upstream failure
- [x] 3.8 Add `PostcardModule` with a client provider reading `POSTCARD_FUNCTION_BASE_URL`, `POSTCARD_FUNCTION_SECRET` and the public art base URL via `getOrThrow`
- [x] 3.9 Add the variables to `.env.dist` and the local `.env`, with the base URL carrying the package as the OSM and AeroLOPA base URLs do, pointed at the shared `functions-mock` container
- [x] 3.10 Add `docker/mock/functions/postcard.json` — the existing glob picks it up, so no new container; require the secret and answer 401 without it, as the other function fixtures do
- [x] 3.11 Add a colocated `postcard.client.spec.ts` covering a confirmed 200, an unconfirmed 202, a `BAD_REQUEST` not being retried, a rejected secret and an unreachable generator

## 4. Postcards and the award (needs 1, 2, 3)

- [x] 4.1 Add `Postcard` (uuid primary key, `cityId` unique, nullable art uuid, nullable art location, width, height, status enum) and `UserPostcard` (`userId`, `postcardId`, `awardedAt`, nullable `seenAt`, `@@unique([userId, postcardId])`) to `schema.prisma`, and migrate
- [x] 4.2 Create the `game` module with a concern folder under each layer: `game/application/command/postcard/`, `game/application/query/postcard/`, `game/application/event/`, `game/infra/database/postcard/`, `game/infra/http/action/postcard/`, `game/model/postcard/`
- [x] 4.3 Add `PostcardRepository` and `UserPostcardRepository` under `game/infra/database/postcard/`
- [x] 4.4 Add `GeneratePostcardCommand`: claim the city with a unique insert so two concurrent attempts produce one postcard, mint a fresh art uuid — never the city id, which every pilot can read from an airport, and never the postcard id, which is fixed for life — call the client, and record the art only once confirmed
- [x] 4.5 Compose the name to draw as the city, a space, then its country resolved from the country catalogue — normalising the country and omitting it entirely where the result would exceed what the generator accepts, so a postcard is never artless because of its country
- [x] 4.6 Leave the postcard without art on a transient failure and retry with the same art uuid so the retry targets the same object; do not retry a permanent `BAD_REQUEST`
- [x] 4.7 Add a `CityWasCreatedEvent` listener under `game/application/event/` that generates in the background without delaying city or airport creation, and does not fail either on a generator error
- [x] 4.8 Add `AwardPostcardCommand`: award the city's postcard to the captain on a first visit only, awarding a postcard that is still awaiting art, and awarding nothing for a flight with no captain
- [x] 4.9 Dispatch the award from the city-visit path when the recorded visit is the pilot's first for that city
- [x] 4.10 Add typed errors under `game/model/postcard/error/`, extending the `DomainError` categories
- [x] 4.11 Register every handler, listener and repository in `GameModule`, and add `GameModule` to `AppModule`
- [x] 4.12 Commit sample postcard images and seed postcard rows for the seeded cities pointing at them, plus awards for seeded pilots consistent with their seeded city visits
- [x] 4.13 Extend the on-block report feature with the award side effect, and cover the first-visit-awards / return-visit-awards-nothing / no-captain-awards-nothing behaviour

## 5. The pilot's collection (needs 4)

- [x] 5.1 Add a get-my-postcards query returning the pilot's held postcards and the total number of postcards that exist, disclosing nothing about unheld ones
- [x] 5.2 Add a get-my-postcard query answering not found — never forbidden — for a postcard the pilot does not hold, so the response does not confirm it exists
- [x] 5.3 Add an acknowledge command setting the seen moment, idempotent for a postcard already seen, not found for one the pilot does not hold
- [x] 5.4 Add the three actions under `game/infra/http/action/postcard/`, each a thin controller over the bus, with a Swagger tag for the game domain
- [x] 5.5 Register the handlers and actions in `GameModule`
- [x] 5.6 Add one feature file per endpoint with admin, cabin-crew and unauthorized actors, asserting full response bodies

## 6. Operations inspection and repair (needs 4)

- [x] 6.1 Add a list-postcards query for operations, reporting every postcard with its city, its art, whether it awaits art, and how many pilots hold it
- [x] 6.2 Add a regenerate command: refuse a postcard already generating, mint a new art uuid so the replacement lands at a new location no cache holds, and leave every holder's seen moment untouched
- [x] 6.3 Take no parameters on regeneration: the city, its country and its continent are already held, and the proportions, fidelity and format are fixed by the system
- [x] 6.4 Add the two actions gated with `@Role(UserRole.Operations)`, importing `UserRole` from the domain enum
- [x] 6.5 Register the handlers and actions in `GameModule`
- [x] 6.6 Add one feature file per endpoint covering operations succeeding, admin and cabin crew forbidden, and unauthenticated unauthorized
- [x] 6.7 Cover that replacing art reaches every holder, does not re-reveal a seen postcard, and lands at a new location
- [x] 6.8 Cover that the city, its country and its continent reach the generator as three separate facts, and that neither the country nor the continent is ever drawn as writing

## 6b. Drawing the art a migration cannot ask for (needs 4)

<!--
Added after the fact. The design's migration plan named a one-off command to draw postcards
for cities created by the migration, and no task in groups 1-6 covered it, so nothing drew
them: a migration writes raw SQL and cannot emit CityWasCreatedEvent.
-->

- [x] 6b.1 Add a repository query for cities needing art — no postcard, a postcard whose art was never drawn, or one whose drawing failed — skipping any drawing already in flight so a repeat call does not draw twice
- [x] 6b.2 Add `DrawMissingPostcardsCommand`, marking each city as being drawn before it returns so the response is authoritative, then queueing it through the same `CityWasCreatedEvent` listener a new city uses
- [x] 6b.3 Add the ops-gated action answering what was queued rather than waiting for art, since one drawing can outlive a request
- [x] 6b.4 Register the handler and action in `GameModule`
- [x] 6b.5 Seed one city with its art never drawn, so both the awaiting-art state and this sweep have a fixture
- [x] 6b.6 Cover it: operations queues only the city lacking art, a draw in flight is not restarted, and admin, cabin crew and unauthenticated callers are refused

## 7. Definition of Done (applied inside every group)

- [x] 7.1 `docker compose exec app npm run lint` and `format:fix` clean; revert the three feature files repo-wide Prettier churns
- [x] 7.2 `docker compose exec app npx jest --runInBand` green for the group's unit specs
- [x] 7.3 `docker compose exec app npm run test:functional` green; cached reads ordered before mutators, since the reset step does not flush the cache
- [x] 7.4 Swagger documents every new endpoint, with closed-set strings carrying `enum:` and nullable primitives an explicit `type:`
- [x] 7.5 New handlers, listeners and repositories registered in their module's providers, and new actions in its controllers
- [x] 7.6 No `PrismaService` outside `infra/database/`; cross-module reads over the bus
- [x] 7.7 Seed fixtures use generated v4 uuids, never hand-crafted patterned ids
