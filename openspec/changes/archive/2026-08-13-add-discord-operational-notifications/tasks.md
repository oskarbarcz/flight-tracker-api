## 1. Preference storage

- [x] 1.1 Add `discordPreliminaryLoadsheetEnabled`, `discordFinalLoadsheetEnabled` and `discordDelayUpdatesEnabled` as `Boolean @default(true)` on `model User`, with a migration, and push the schema to the dev database
- [x] 1.2 Add the three fields to the seeded users
- [x] 1.3 Extend the `DiscordSettings` model and `UsersRepository.getDiscordSettings` / `updateDiscordSettings` to carry all four flags, writing only the ones supplied

## 2. Settings API

- [x] 2.1 Add the `DiscordNotification` enum naming each switchable kind and mapping it to its settings field, with both delay messages sharing `DelayUpdates`
- [x] 2.2 Make every field of `UpdateDiscordSettingsDto` optional and validated as a boolean
- [x] 2.3 Add `GetDiscordRecipientQuery(userId, notification)` + handler in the users module, returning the Discord id only when the account is linked and that notification is enabled
- [x] 2.4 Register the new handler in `UsersModule`

## 3. Message plumbing

- [x] 3.1 Widen `DiscordMessageType` with `preliminary-loadsheet`, `final-loadsheet`, `delay-allocation` and `delay-approval`, and widen `DiscordDirectMessage` to every direct-message type
- [x] 3.2 Add `FlightsRepository.getCaptainId(flightId)`

## 4. Message text

- [x] 4.1 Add `formatLoadsheet` to the Discord formatter, parameterised by preliminary/final, rendering named crew with roles and the loadsheet figures, omitting the crew section when there is none
- [x] 4.2 Add `formatDelayAllocationRequest` (minutes to allocate plus the allocation link) and `formatDelayApproval`
- [x] 4.3 Extend the formatter spec for all three, including the empty-crew case and the preliminary/final titles

## 5. Listeners

- [x] 5.1 Add `SendPreliminaryLoadsheetListener` on `BoardingWasStarted`, resolving crew through `ListFlightCrewQuery`
- [x] 5.2 Add `SendFinalLoadsheetListener` on `BoardingWasFinished`
- [x] 5.3 Add `SendDelayAllocationRequestListener` on `DelayRequestWasCreated`, linking to `${FRONTEND_BASE_URL}/flight/<id>/delay`
- [x] 5.4 Add `SendDelayApprovalListener` on `DelayReportWasAccepted`
- [x] 5.5 Rework `SendFlightBriefingListener` to resolve its recipient through `GetDiscordRecipientQuery`
- [x] 5.6 Register the four listeners in `FlightsModule`
- [x] 5.7 Give each new listener a spec covering delivery, the disabled setting, the missing account, the absent captain, the missing loadsheet and a rejected send

## 6. Functional coverage

- [x] 6.1 Extend `user.me.discord-settings.feature` for the four flags, partial updates and per-field validation
- [x] 6.2 Extend `flight.start-boarding.feature` and `flight.finish-boarding.feature` with the loadsheet messages
- [x] 6.3 Cover both delay messages in the delay features, including that a rejection sends nothing
- [x] 6.4 Cover that a pilot who disabled one kind still receives the others

## 7. Verification and docs

- [x] 7.1 Run lint, format and the Jest unit suite
- [x] 7.2 Run the affected Cucumber features, then the full functional suite
- [x] 7.3 Document the four messages and the five settings in the README Discord section
