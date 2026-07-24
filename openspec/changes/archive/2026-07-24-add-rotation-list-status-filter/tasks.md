## 1. Implementation

- [x] 1.1 Add `ListRotationsFilters` DTO with an optional `status` validated against `RotationStatus` (`@IsOptional` + `@IsEnum`).
- [x] 1.2 `ListRotationsAction` reads `@Query() filters: ListRotationsFilters` and passes `status` into the query (documented via `@ApiQuery`).
- [x] 1.3 `ListRotationsQuery` carries an optional `status`; handler forwards it to the repository.
- [x] 1.4 `RotationsRepository.findAll` criteria accepts `status` and applies it to the Prisma `where`.

## 2. Tests & verification

- [x] 2.1 `features/rotation/rotation.list.feature` — unfiltered list (full body), filter by a state (full body), invalid state → `400` (full body).
- [x] 2.2 Lint / format clean; rotation functional suite green.
