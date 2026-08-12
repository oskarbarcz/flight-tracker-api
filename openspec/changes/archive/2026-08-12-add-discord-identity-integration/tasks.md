## 1. Schema and configuration

- [x] 1.1 Add `discordUsername`, `discordGlobalName`, `discordAvatar` and `googleEmail` as nullable columns on `user`, with the matching migration
- [x] 1.2 Add `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_OAUTH_REDIRECT_URIS`, `DISCORD_API_HOST` and `DISCORD_GATEWAY_ENABLED` to `.env.dist` with placeholder values
- [x] 1.3 Add the `discord-mock` mockserver service to `compose.yaml` and point `DISCORD_API_HOST` at it for local and test runs

## 2. Discord REST client

- [x] 2.1 Add `BadGatewayError` (502) to the domain error categories and map it in `DomainExceptionFilter`
- [x] 2.2 Add `DiscordIdentityClient` with `exchangeCode`, `getCurrentUser` and `addGuildMember`, fetching through `fetch-with-retry`
- [x] 2.3 Validate the redirect URI against the configured allowlist before any code exchange
- [x] 2.4 Add `InvalidDiscordAuthorizationCodeError`, `DiscordRedirectUriNotAllowedError`, `DiscordServerJoinNotAuthorizedError` and `DiscordUnreachableError`
- [x] 2.5 Add `findMembership` to `DiscordGateway`, answering `unknown` whenever the truth cannot be established
- [x] 2.6 Gate the gateway connection on `NODE_ENV=production` or `DISCORD_GATEWAY_ENABLED`, keeping message delivery gated on `NODE_ENV` alone

## 3. Repository and profile read

- [x] 3.1 Add `findByDiscordId`, `linkDiscordAccount`, `unlinkDiscordAccount`, `hasLinkedDiscordAccount` and `getDiscordId` to `UsersRepository`
- [x] 3.2 Resolve the `identities` object in `GetOwnUserQuery` from stored fields alone, covering both Google and Discord
- [x] 3.3 Remove `discordId` from `UpdateOwnProfileDto` so a self-service update can no longer set it

## 4. Endpoints

- [x] 4.1 Add `SignInWithDiscordCommand` + handler resolving the user by `discordId` only, throwing `DiscordAccountNotLinkedError` otherwise, and the `POST /api/v1/auth/discord` action
- [x] 4.2 Add `LinkDiscordAccountCommand` + handler returning the link state and join outcome, and the `POST /api/v1/user/me/link-discord-account` action
- [x] 4.3 Reject a link that asks to join when the granted authorization lacks the join scope; keep the link when the join itself fails
- [x] 4.4 Add `UnlinkDiscordAccountCommand` + handler requiring the current password and refusing a passwordless or unlinked account, and the `POST /api/v1/user/me/unlink-discord-account` action
- [x] 4.5 Add `GetDiscordServerMembershipQuery` + handler and the `GET /api/v1/user/me/discord/server-membership` action
- [x] 4.6 Register every new handler in `providers` and every new action in `controllers` of `AuthModule`

## 5. Tests and documentation

- [x] 5.1 Add `docker/mock/discord.json` fixtures covering the token exchange, identity read and join outcomes, using synthetic snowflakes only
- [x] 5.2 Seed a Discord-linked cabin crew user and a Google-only user who is also Discord-linked
- [x] 5.3 Add Jest specs for `DiscordIdentityClient` covering the allowlist, rejected codes, incomplete profiles and join outcomes
- [x] 5.4 Add Cucumber features for Discord sign-in, linking, unlinking and membership, with the defensive RBAC scenarios
- [x] 5.5 Document the bot/OAuth split, the endpoint contract and the membership precondition in `README.md`
- [x] 5.6 Verify the full suite: lint, `npm test`, and `npm run test:functional`
