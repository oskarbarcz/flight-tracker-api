## 1. Schema and seed

- [x] 1.1 Add the `ChangeRequestResource` (`airport`) and `ChangeRequestStatus` (`pending`, `accepted`, `rejected`, `withdrawn`) enums and the `ChangeRequest` model, with its requester and decider relations to `User` and its indexes, to `prisma/schema.prisma`
- [x] 1.2 Create the migration, regenerate the client into `prisma/client/` and sync the dev DB with `prisma db push`
- [x] 1.3 Add `prisma/seed/resource/change-requests.seed.ts` with airport proposals: two pending (one from each of two crew users on the same airport), one accepted and one rejected with a reason, all on fixed random v4 UUIDs, and wire it into `loadResources()`

## 2. Airports module support

- [x] 2.1 Add `AssertCityExistsQuery` (404 with a typed city-not-found error) and register it
- [x] 2.2 Add `ReassignAirportCityCommand(airportId, cityId)`, which only sets the airport's city foreign key, and register it
- [x] 2.3 Confirm that `UpdateAirportCommand` without `city` leaves the city and `dataQuality` untouched, and that it invalidates any cached airport reads

## 3. change-requests module core

- [x] 3.1 Scaffold `src/modules/change-requests/` (`application/`, `infra/`, `model/`) and register `ChangeRequestsModule` in `AppModule`
- [x] 3.2 Add the domain model types, the request response class (Swagger `enum:` for `resource`/`status`) and the `ChangedField` shape
- [x] 3.3 Add the typed errors in `model/error/change-request.error.ts`: not found, target not found, not pending, nothing to change, not owner
- [x] 3.4 Implement the pure `diffChangeRequest` in `model/change-request.diff.ts`, with a colocated `change-request.diff.spec.ts` covering scalar fields, deep geometry equality, `cityId` against `city.id`, and the empty-diff case
- [x] 3.5 Add `ChangeRequestsRepository` (`create`, `findById`, `list({status, resource})` oldest first, `listByRequester(userId, {status})` newest first, and a conditional `transition` that writes only `WHERE status = 'pending'`)
- [x] 3.6 Define the `ChangeRequestTarget` interface, the `CHANGE_REQUEST_TARGETS` multi-provider and a resolver that looks adapters up by `resource`
- [x] 3.7 Implement `AirportChangeRequestTarget`: `read` via `GetAirportByIdQuery`, mapping a missing airport to target-not-found; `apply` via `UpdateAirportCommand` for scalar fields and `ReassignAirportCityCommand` for `cityId`

## 4. Application handlers

- [x] 4.1 `SubmitAirportChangeRequestCommand`: assert the airport and city exist, diff against current values (422 when nothing changes), then create the request as pending
- [x] 4.2 `ListChangeRequestsQuery` and `GetChangeRequestByIdQuery`; the latter attaches the live diff through the adapter
- [x] 4.3 `AcceptChangeRequestCommand`: check it is pending (409), read and snapshot the target (404 leaves it pending), apply, transition to accepted with the decider and timestamp, emit `ChangeRequestWasDecidedEvent`
- [x] 4.4 `RejectChangeRequestCommand`: check it is pending (409), transition to rejected with reason, decider and timestamp, emit the event
- [x] 4.5 `WithdrawChangeRequestCommand`: owner only (403), pending only (409), transition to withdrawn
- [x] 4.6 `ListMyChangeRequestsQuery` with an optional status filter
- [x] 4.7 Add `ChangeRequestWasDecidedEvent` to `src/core/domain/events/dto/`
- [x] 4.8 Register every handler and adapter in `change-requests.module.ts`

## 5. HTTP actions

- [x] 5.1 `RequestAirportChangeAction`, `POST api/v1/airport/:airportId/request-data-change` (CabinCrew), with the `RequestAirportChangeRequest` DTO including its at-least-one-field check
- [x] 5.2 `ListChangeRequestsAction`, `GET api/v1/user-data-change-request` (Operations, Admin), with enum-validated `status` and `resource` query params
- [x] 5.3 `GetChangeRequestAction`, `GET api/v1/user-data-change-request/:id` (Operations, Admin)
- [x] 5.4 `AcceptChangeRequestAction` and `RejectChangeRequestAction` (Operations, Admin); reject takes a `{ reason }` body
- [x] 5.5 `ListMyChangeRequestsAction`, `GET api/v1/user/me/data-change-request?status=` (CabinCrew, enum-validated `status`), and `WithdrawChangeRequestAction`, `DELETE api/v1/user-data-change-request/:id` (CabinCrew, 204)
- [x] 5.6 Register all actions in the module's `controllers` and check the Swagger output (enum sets, no restating descriptions)

## 6. Functional tests

- [x] 6.1 `features/change-request/change-request.request-airport.feature`: happy path (airport unchanged afterwards), empty body, invalid country, unknown airport, unknown city, nothing to change, a second pending proposal on the same airport, RBAC (cabin crew 201, ops 403, admin 403, anonymous 401)
- [x] 6.2 `change-request.list.feature`: unfiltered, status filter, resource filter, unsupported resource (400), RBAC
- [x] 6.3 `change-request.get.feature`: live diff, drift after a direct PATCH, unknown id, RBAC
- [x] 6.4 `change-request.accept.feature`: applies name and city, last write wins, grade unchanged for `low` and `flagship` airports, already decided (409), RBAC; assert the airport through `GET airport/:id`
- [x] 6.5 `change-request.reject.feature`: with reason, missing reason (400), already decided (409), RBAC
- [x] 6.6 `change-request.list-mine.feature` and `change-request.withdraw.feature`: own only, status filter, unknown status (400), withdraw own pending, someone else's (403), decided (409), accept after withdraw (409)
- [x] 6.7 Reconcile the scenarios with the seed statically, then run `npx jest --runInBand src/modules/change-requests` and `npm run test:functional`, plus lint and format

## 7. Wrap-up

- [x] 7.1 Update `CLAUDE.md` (architecture section) with a short paragraph on the change-requests module and its adapter seam
- [x] 7.2 `openspec validate add-data-change-requests --strict`
