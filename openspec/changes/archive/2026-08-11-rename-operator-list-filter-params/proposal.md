## Why

Both filters on the operator list were named in kebab-case — `recent-only` and `service-type` — which is not a valid TypeScript identifier. `OperatorListFilters` therefore had to declare them as quoted string-literal properties, and every reader of the DTO had to use bracket access (`filters['recent-only']`). That spelling is foreign to the rest of the codebase, breaks destructuring, and gives the type checker no help against a typo inside the brackets. The parameters are renamed to `recentOnly` and `serviceType` so the DTO declares plain identifiers.

The wire names change with the properties rather than being mapped onto them. The global validation pipe runs with `whitelist` and `forbidNonWhitelisted`, so translating a kebab wire name onto a camelCase property through `@Expose({ name })` leaves the raw kebab key present as an extraneous property and the request is rejected. Matching names is the only spelling that works without relaxing that pipe.

## What Changes

- Rename the operator list query parameter `recent-only` to `recentOnly`, and `service-type` to `serviceType`. The values, semantics, defaults, caching, and response bodies of both filters are unchanged.
- Declare both as plain identifiers on `OperatorListFilters`, replacing the quoted string-literal properties, so call sites read `filters.recentOnly` and `filters.serviceType`.
- Reject the former hyphenated spellings. They are now unknown query parameters, so the validation pipe answers `400` with `property <name> should not exist` rather than ignoring them and silently returning an unfiltered list.
- Carry the rename into the validation violation keys and messages, which echo the property name: `"recentOnly": ["recentOnly must be a boolean value"]`.

This is a **breaking change** for any caller using `?recent-only=`. That parameter shipped with the recent-carriers filter; `?service-type=` had not been released before this rename.

## Capabilities

### Modified Capabilities

- `operator-recent-carriers`: the recent-carriers filter is named `recentOnly`.
- `operator-service-type`: the traffic filter is named `serviceType`.

## Impact

**API** — two renamed query parameters on `GET /api/v1/operator`, breaking for `recent-only`. Failure is loud rather than silent: a stale caller gets `400`, not an unfiltered list that looks like a successful response. Swagger reflects the new names from the `@ApiQuery` declarations.

**Code** — `src/modules/operators/infra/http/request/operator.request.ts` (both properties), `infra/http/action/operator/list-operators.action.ts` (both `@ApiQuery` names, and the reads, which become property access and destructuring), and `src/core/cache/operator-list-cache.interceptor.ts`, whose `RECENT_ONLY_QUERY_PARAM` constant is compared against raw query keys — had it been missed, the recent list would have quietly stopped being cached and every filtered request would have started being cached under the shared list key.

**Database, queries, repositories** — untouched. The rename stops at the HTTP boundary; the CQRS queries already took a typed `serviceType` argument.

**Tests** — every feature URL and violation-key assertion for both filters, plus a new scenario per filter proving the old spelling is rejected.

**Documentation** — the two living specs and the archived changes that named the parameters were updated to the new spelling.
