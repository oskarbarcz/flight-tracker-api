## Context

See `proposal.md` § Why for motivation. Two pieces of current state constrain the options:

**The validation pipe forbids unknown properties.** `configureInputValidation` in `src/core/validation/validation.config.ts` registers the global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`. Any key on the incoming query object that no decorated property claims is an error, not something to be stripped.

**The cache interceptor matches raw query keys.** `OperatorListCacheInterceptor` reads `request.query` directly and compares its keys against `RECENT_ONLY_QUERY_PARAM`, using them to decide both whether a request is cacheable at all and which cache key it gets. It never sees the transformed DTO, so it has its own copy of the wire name.

## Goals / Non-Goals

**Goals:**

- Plain TypeScript identifiers on the filters DTO, so call sites use property access rather than bracket indexing.
- One spelling per filter, shared by the wire and the code, with nothing translating between them.
- A loud failure for the old spelling rather than a silent unfiltered response.

**Non-Goals:**

- Any change to what the filters do. Values, membership semantics, the recent-carriers cap, ordering, caching, and response bodies are untouched.
- Renaming query parameters on other list endpoints. No other DTO in the codebase declares a quoted property; the flight, airport, rotation, and user list filters are already plain identifiers.
- Accepting both spellings during a transition period.
- Renaming the `RECENT_ONLY_QUERY_PARAM` constant itself. `SCREAMING_SNAKE_CASE` is correct for a constant; only its value changes.

## Decisions

### The wire name follows the property name, rather than being mapped onto it

`?recentOnly=true`, `?serviceType=cargo`.

_Why:_ with `forbidNonWhitelisted: true`, a `@Expose({ name: 'recent-only' })` mapping onto a `recentOnly` property does populate the property, but the raw `recent-only` key stays on the plain object and is reported as a property that should not exist. The request would fail with a confusing violation about the very parameter the caller spelled correctly. Making the two names identical removes the translation layer entirely.

_Alternative considered:_ keep the kebab wire names and relax the pipe for this DTO — either dropping `forbidNonWhitelisted` locally or whitelisting the kebab keys as extra optional properties. Rejected: it weakens a global input-validation guarantee to preserve a spelling, and it leaves two names for one thing in the codebase permanently.

_Alternative considered:_ keep kebab wire names and read them off `request.query` manually, skipping the DTO. Rejected: it discards validation, transformation, and the Swagger contract for both filters.

### The old spelling is rejected, not silently ignored

`?recent-only=true` answers `400` with `property recent-only should not exist`.

_Why:_ this is what the existing pipe configuration already does with an unknown parameter, and it is the better outcome. The alternative — accepting and ignoring it — would return the full operator list with `200`, which a stale client cannot distinguish from a working filter. A `400` names the offending parameter and points straight at the fix.

_Consequence:_ this is the breaking part of the change, and it applies only to `recent-only`; `service-type` had not shipped. Pinned by one feature scenario per filter asserting the rejection, so a future attempt to re-add a kebab alias has to confront the specified behaviour.

### The interceptor's constant is updated, not routed around

`RECENT_ONLY_QUERY_PARAM` keeps its name and takes the value `'recentOnly'`.

_Why:_ the interceptor's whole job is deciding cacheability from raw query keys, so it legitimately holds the wire name. The risk is that it is a second, silent copy: had it kept `'recent-only'`, `isCacheableRequest` would have seen `recentOnly` as an unrecognised parameter and stopped caching the recent list, while `isRecentOperatorListRequest` would have stopped recognising recent requests and started caching them under the shared `operators:list` key — a correctness bug, not just a cache miss, since one user's recent carriers would then answer the shared list. Nothing in the type system connects the constant to the DTO, so the rename had to be made deliberately in both places.

_Considered and rejected:_ deriving the constant from the DTO to make the coupling explicit. There is no clean way to get a property name out of a class at runtime without a decorator registry or a `keyof` dance that still needs a literal somewhere, so it would trade one silent copy for more machinery.

## Risks / Trade-offs

**A released parameter changes spelling** → `?recent-only=` callers break. Mitigated by failing loudly with a violation that names the parameter, and by the fact that the filter is an optimisation on a list endpoint that still works unfiltered.

**The cache interceptor could drift again** → Any future rename of either parameter has to touch the constant too, and a miss is a cache-correctness bug rather than a visible failure. Recorded in the decision above; the existing recent-carriers caching scenarios would catch it.

**Archived documents were retroactively updated** → The two living specs and the archived changes that named the parameters now show the new spelling, so the earlier documents no longer record the name they shipped under. This change is the record of the rename.

## Migration Plan

No data migration; nothing is stored.

1. Rename both properties and both `@ApiQuery` names, and update the interceptor constant's value.
2. Sweep the feature files for the parameter in URLs and in violation keys and messages, remembering that the messages echo the property name.
3. Restart the `app` container and probe the endpoint for both new names, both old names, the invalid-value cases, and the two-filter combination before running the suites.

**Rollback:** revert the property names, the two `@ApiQuery` names, and the interceptor constant's value together. Reverting only some of them leaves the cache interceptor disagreeing with the DTO, which fails quietly.
