## 1. Setting storage

- [x] 1.1 Add `discordRichPresenceEnabled Boolean @default(false)` to `model User` in `prisma/schema.prisma`, hand-write the `add_discord_rich_presence_setting` migration and push the schema to the dev database
- [x] 1.2 Set the column explicitly on every user in `prisma/seed/resource/users.seed.ts`
- [x] 1.3 Read and write it through `UsersRepository.getDiscordSettings` / `updateDiscordSettings` as `richPresenceEnabled`
- [x] 1.4 Add `richPresenceEnabled` to the `DiscordSettings` model and as an optional boolean on `UpdateDiscordSettingsDto`

## 2. Presence content

- [x] 2.1 Add `model/discord-presence.model.ts`: the `DiscordPresence` response class, the status labels, the phase-to-time rule, the route wording, the asset keys, and `buildDiscordPresence` over a narrow `PresenceFlight` input
- [x] 2.2 Cover the builder with a colocated Jest spec: full activity, non-route airports ignored, schedule fallback, estimate preferred, unknown due time, and a flight with no destination

## 3. Presence endpoint

- [x] 3.1 Add `GetDiscordPresenceQuery` + handler: short-circuit to null when the setting is off or the user has no current flight, otherwise read the flight via `GetFlightQuery` and build the activity
- [x] 3.2 Add `GetDiscordPresenceAction` for `GET /api/v1/user/me/discord-presence`, answering `204` when the query resolves to null
- [x] 3.3 Register the action in `controllers` and the handler in `providers` of `UsersModule`

## 4. Functional coverage

- [x] 4.1 Add `user.me.discord-presence.feature`: the activity for a checked-in flight, the scheduled-times fallback, a landed flight, the setting off, turning it back off, users with no flight, and the unauthorized case
- [x] 4.2 Extend the Discord settings feature with the new setting, its default and turning it on and off
- [x] 4.3 Add the seeded users and flight states the scenarios need, and carry the new field into the settings assertions

## 5. Verification and docs

- [x] 5.1 Run lint, format and the Jest unit suite
- [x] 5.2 Run the affected user features, then the full functional suite
- [x] 5.3 Document the presence endpoint and the setting in the README Discord section
