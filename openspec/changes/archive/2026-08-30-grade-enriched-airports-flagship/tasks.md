## 1. An enriched airport stops reading as one that still needs curation

- [x] 1.1 In `push-airport-osm-data.command.ts`, after every selected change has been applied, raise the airport to `DataQuality.Flagship` through `AirportsRepository.update` when the tally records at least one `added`, `updated` or `removed` outcome — reusing the `PushTotals` already built for the response rather than tracking a second flag
- [x] 1.2 Add a handler spec proving the grade is written once on a push that lands a change, and not written at all when every outcome is `skipped` or `failed`
- [x] 1.3 In `features/airport/enrich/enrich.push.feature`, extend the scenario that pushes `runway:27` and `terminal:NT` to read the airport afterwards and assert its full body with `"dataQuality": "flagship"`, before the database is reset
- [x] 1.4 In the same file, extend the all-skipped scenario (`runway:09`) to read the airport and assert its full body still reports `"dataQuality": "low"` — it writes nothing, so it must stay the one push scenario needing no database reset
- [x] 1.5 Check the remaining `enrich.push.feature` scenarios that write (`gate:5`, `gate:6` + `runway:14`, `parkingPosition:20` + `terminal:NT`) still reset the database, so EDDW's grade cannot leak into the airport, flight and diversion features that assert `"dataQuality": "low"` for it
- [x] 1.6 Document the raise on `PushOsmDataAction`'s `@ApiOperation` description, so the contract says the push grades the airport
- [x] 1.7 `npm run lint`, `npm run typecheck`, `npm test` and `npm run test:functional` green
