## Why

Discord was already the delivery channel for flight announcements and pilot briefings,
but the API had no way to know _which_ Discord account belonged to which user. The
link was a self-declared `discordId` typed into `PATCH /api/v1/user/me` — an
authentication identifier set by the very account it was supposed to authenticate.
Anyone could claim any snowflake, so the field could not be trusted to prove identity
and could not be used to sign in.

A briefing DM also only arrives if the recipient shares the server with the bot. With
a hand-typed identifier the API could neither verify membership nor help a user join,
so a pilot could link a correct account and still silently receive nothing.

## What Changes

- Add `POST /api/v1/auth/discord` — sign in with a Discord authorization code. The
  user is resolved by `discordId` **only**; an unlinked account is rejected as
  unauthorized and no account is ever created.
- Add `POST /api/v1/user/me/link-discord-account` — an authenticated user completes an
  OAuth exchange to prove they own a Discord account, optionally joining the server in
  the same consent pass (`joinServer`). Returns the resulting link state and a
  `joinOutcome`, so the UI needs no refetch.
- Add `POST /api/v1/user/me/unlink-discord-account` — clears the link on submission of
  the current password. Never removes the user from the Discord server.
- Add `GET /api/v1/user/me/discord/server-membership` — a live membership probe
  reporting `member`, `not_member` or `unknown`.
- **BREAKING**: `discordId` is removed from `PATCH /api/v1/user/me`. It is an
  authentication identifier, so only a completed OAuth exchange may write it. Existing
  clients that set it must move to the link endpoint.
- `GET /api/v1/user/me` reports both providers under a new `identities` object
  (`google` and `discord`, each `linked` plus provider detail) from stored fields
  alone, contacting nobody.
- No Discord OAuth token is stored. The server join happens inside the link request
  while the access token is in memory, and is discarded with it.
- The bot gateway gains `DISCORD_GATEWAY_ENABLED`, an escape hatch to connect to a
  real server outside production; message delivery stays gated on `NODE_ENV` alone.

## Capabilities

### New Capabilities

- `discord-account-link`: proving ownership of a Discord account through OAuth and
  attaching it to — or detaching it from — a user account, including the safeguards
  that stop a user locking themselves out.
- `discord-sign-in`: exchanging a Discord authorization code for a session on an
  already-linked account.
- `discord-server-membership`: establishing whether a linked account is in the
  Discord server, and joining it during linking.

### Modified Capabilities

- `user-profile-self-service`: `discordId` moves out of self-service — it can no
  longer be set through `PATCH /api/v1/user/me`, and the profile read gains the
  `identities` object.

## Impact

- **`auth` module:** `SignInWithDiscordCommand`, `LinkDiscordAccountCommand`,
  `UnlinkDiscordAccountCommand`, `GetDiscordServerMembershipQuery` + handlers; four
  action controllers; `DiscordSignInDto` / `LinkDiscordAccountDto`; new error
  `DiscordAccountNotLinkedError`.
- **`users` module:** `UsersRepository` gains `findByDiscordId`, `linkDiscordAccount`,
  `unlinkDiscordAccount`, `hasLinkedDiscordAccount` and `getDiscordId`; new errors
  `UserHasNoLinkedDiscordAccountError` and `CannotUnlinkDiscordWithoutPasswordError`;
  `GetOwnUserQuery` resolves the `identities` object.
- **`core/provider/discord`:** new `DiscordIdentityClient` (OAuth token exchange,
  `users/@me`, `guilds/*/members/*`) fetching through `fetch-with-retry`, with
  `InvalidDiscordAuthorizationCodeError`, `DiscordRedirectUriNotAllowedError`,
  `DiscordServerJoinNotAuthorizedError` and `DiscordUnreachableError`;
  `DiscordGateway` gains `findMembership`.
- **Config:** `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_OAUTH_REDIRECT_URIS`,
  `DISCORD_API_HOST`, `DISCORD_GATEWAY_ENABLED`.
- **Schema/migration:** `user` gains `discordUsername`, `discordGlobalName`,
  `discordAvatar` (and `googleEmail`); `discordId` already existed and stays nullable.
- **Errors:** `BadGatewayError` (502) is added as the only non-4xx `DomainError`
  category, for an unreachable Discord.
- **Tests:** new `discord-mock` mockserver container + `docker/mock/discord.json`;
  Cucumber features for sign-in, linking, unlinking and membership; Jest specs for
  `DiscordIdentityClient`.
- **`README.md`:** the Discord section documents the split between bot and OAuth
  client, the endpoint contract, and the membership precondition.
