## 1. Provider client

- [x] 1.1 Add `findOperationalFlightPlan(userId)` to `SimbriefClient`, answering null for an unknown user — a rejected request or a payload whose `fetch.status` reads `unknown userid` — and throwing on anything it cannot read
- [x] 1.2 Reduce `getOperationalFlightPlan` to the throwing wrapper over the finder
- [x] 1.3 Add `SimbriefUserNotFoundError` (404) and `SimbriefUnavailableError` (502) next to the client
- [x] 1.4 URL-encode the user ID into the fetch URL
- [x] 1.5 Extend the provider types with `fetch`, the airport `iata_code` and `name`, the aircraft `icaocode` and `name`, and `params.time_generated`
- [x] 1.6 Cover the client with a colocated spec: a plan, both unknown-user shapes, an unfetched plan, a failing provider, an unreachable provider, and the throwing getter

## 2. Account lookup

- [x] 2.1 Add `model/simbrief-account.model.ts` with the account, flight, airport and aircraft response classes
- [x] 2.2 Add `VerifySimbriefUserQuery` + handler mapping the plan onto the account model, normalising unfilled text to null and unix times to dates
- [x] 2.3 Add `VerifySimbriefUserAction` for `GET /api/v1/user/simbrief/{simbriefUserId}`
- [x] 2.4 Cover the handler with a spec: the reported plan, empty fields as null, and an unknown ID

## 3. Verification on save

- [x] 3.1 Add `AssertSimbriefUserExistsQuery` + handler under `application/assert/`, throwing `InvalidSimbriefUserIdError` for an unknown ID and accepting the value with a warning when the lookup fails
- [x] 3.2 Dispatch it from `UpdateOwnProfileHandler` when the patch carries a non-empty ID
- [x] 3.3 Add the digits-only `@Matches` rule to `simbriefUserId` in `UpdateOwnProfileDto` and state the verification in its description
- [x] 3.4 Cover the assert handler: a resolved ID, an unknown ID, and an ID SimBrief could not confirm
- [x] 3.5 Register the query, the assert and the action in `UsersModule`

## 4. Fixtures and functional coverage

- [x] 4.1 Add a known account (`987654`) and an unknown one (`999999`) to `docker/mock/simbrief.json` and restart the `simbrief-mock` container
- [x] 4.2 Add `features/user/simbrief/simbrief.verify.feature`: the resolved account for two roles, the unknown ID, and the unauthorized case
- [x] 4.3 Extend the profile update feature with setting, clearing and rejecting a Simbrief user ID

## 5. Test layout

- [x] 5.1 `git mv` the flat `features/user/*.feature` files into `account/`, `aircraft/`, `discord/`, `identity/`, `management/`, `profile/`, `simbrief/`, `statistics/` and `travel/`

## 6. Verification

- [x] 6.1 Run lint, format and the Jest unit suite
- [x] 6.2 Run the user features, then the full functional suite
