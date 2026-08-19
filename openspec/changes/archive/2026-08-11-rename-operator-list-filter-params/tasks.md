## 1. Request contract

- [x] 1.1 Replace the quoted property `'recent-only'?: boolean` on `OperatorListFilters` with the plain identifier `recentOnly?: boolean`, keeping its `@IsOptional()`, `@Transform`, and `@IsBoolean()` decorators unchanged.
- [x] 1.2 Replace the quoted property `'service-type'?: OperatorServiceType` with `serviceType?: OperatorServiceType`, keeping `@IsOptional()` and `@IsEnum(OperatorServiceType)`.
- [x] 1.3 Confirm no other DTO in `src/` declares a quoted property — the Helmet CSP directive keys in `src/core/http/helmet/helmet.config.ts` are an external format and stay hyphenated.

## 2. Action

- [x] 2.1 Rename both `@ApiQuery({ name })` values in `ListOperatorsAction` to `recentOnly` and `serviceType`, leaving the descriptions and types as they are.
- [x] 2.2 Replace the bracket reads with property access: `const { serviceType } = filters` and `if (filters.recentOnly)`.

## 3. Cache interceptor

- [x] 3.1 Change `RECENT_ONLY_QUERY_PARAM` in `src/core/cache/operator-list-cache.interceptor.ts` to `'recentOnly'`, keeping the constant's own name. It is compared against raw query keys, so leaving it behind would both stop the recent list being cached and start caching it under the shared `operators:list` key — a correctness bug, since one user's recent carriers would then answer the shared list.
- [x] 3.2 Confirm no other module reads either parameter off `request.query` directly.

## 4. Functional tests

- [x] 4.1 Rewrite every parameter occurrence in `features/operator/operator.list-recent.feature` and `features/operator/operator.list-by-service-type.feature` — request URLs, violation keys, and violation messages, which echo the property name (`"recentOnly": ["recentOnly must be a boolean value"]`).
- [x] 4.2 Add a scenario to `operator.list-recent.feature` asserting `?recent-only=true` answers `400` with `property recent-only should not exist`.
- [x] 4.3 Add the equivalent scenario for `?service-type=cargo` to `operator.list-by-service-type.feature`.

## 5. Documentation

- [x] 5.1 Update the parameter names in the living specs `openspec/specs/operator-recent-carriers/spec.md` and `openspec/specs/operator-service-type/spec.md`.
- [x] 5.2 Update the archived changes that named the parameters — `2026-08-07-add-recent-operators-filter`, `2026-08-11-add-operator-service-type`, and `2026-08-11-add-operator-service-type-filter` — matching only the standalone parameter tokens, so the capability names `operator-service-type` and `flight-service-type` are not corrupted.
- [x] 5.3 Rewrite the three sentences that argued _for_ the kebab spelling, in the recent-operators `design.md` and `tasks.md` and the filter change's `design.md`, so they no longer contradict the names they now show.
- [x] 5.4 Leave `PATCH /:id/service-type` in `2026-08-06-flight-service-type/design.md` alone — it is a rejected URL path on the flight endpoint, not this query parameter.

## 6. Verification

- [x] 6.1 `docker compose exec app npm run lint`.
- [x] 6.2 `docker compose exec app npm test` — 183 tests pass.
- [x] 6.3 Restart the `app` container, then probe the endpoint for both new names, the two-filter combination, both invalid values, and the old hyphenated spelling, confirming the last answers `400 property … should not exist`.
- [x] 6.4 `docker compose exec app npm run test:functional` — 967 scenarios pass, before the two rejection scenarios were added.
- [x] 6.5 `docker compose exec app npx cucumber-js features/operator` after adding them — 49 scenarios pass.
- [x] 6.6 `openspec validate --all --strict`.
