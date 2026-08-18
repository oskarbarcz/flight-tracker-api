## Why

The product is called MyPreflight and lives at mypreflight.io. "Flight Tracker" was the
working name from the first commit, and it was still the name a user actually met: in the
Discord messages the bot sends, in the sender line of every transactional email, in the
Swagger title, and in the domain the API allowed as an origin. A rename that stops at the
marketing site leaves the product introducing itself by two different names depending on
which surface the user touches.

The domain move makes it more than cosmetic. CORS, the Helmet content-security policy and
the Discord OAuth redirect allow-list all name the front end explicitly, so the front end
cannot move to mypreflight.io until the API says mypreflight.io.

The README had also become the wrong document. It had grown into a mixture of product
description, Discord message contracts, WebSocket protocol and email behaviour — the kind of
material a reader consults once and a contributor needs in full. Splitting it was overdue,
and doing it in the same pass avoided rebranding prose that was about to be moved anyway.

## What Changes

- Rename every user-facing occurrence of the product to MyPreflight: the Discord message
  copy (`MyPreflight app`, and the `MyPreflight` link on the live map), the transactional
  email bodies, the Swagger title, and the mail sender display name.
- Point the API at the new domain: `https://mypreflight.io` as the allowed CORS origin and
  CSP connect target, `https://api.mypreflight.io` as the documented production server, and
  the Discord OAuth redirect allow-list.
- Turn the README into a product-facing document and move the contributor-facing contracts
  into `docs/DISCORD.md`, `docs/EMAILS.md` and `docs/WEBSOCKETS.md`.
- Modernise both workflows while their files were open: split integrity into a `files` job
  (line endings, file permissions, version uniqueness) and a `code` job, replace the local
  `docker/ci/check_version_is_free` script with the shared action that does the same, move
  onto current action versions and `ubuntu-latest`, and rename the image-publishing
  environment from `ghcr` to `image`.
- Deliberately leave three things named as they are: the npm package (`flight-tracker-api`),
  the Swagger contact address, and the Discord presence small-image asset key
  (`flight-tracker`). The first two are identifiers rather than product copy; the third
  names an asset already uploaded to the Discord application, and renaming it would break
  the image without changing anything a user reads.

## Capabilities

### Modified Capabilities

- `transactional-email`: the sender identity and message copy name the product as
  MyPreflight.
- `discord-flight-briefing`: the briefing's closing link names the MyPreflight app.

## Impact

- **User-visible**: Discord messages and emails name MyPreflight; `/api` is titled
  MyPreflight API. No endpoint, payload or status code changes.
- **Configuration**: `MAIL_FROM_ADDRESS` and `DISCORD_OAUTH_REDIRECT_URIS` in `.env.dist`
  change, so both must be updated in every deployed environment. A stale redirect URI breaks
  Discord sign-in; a stale CORS origin breaks the front end.
- **Docs**: README rewritten; three new documents under `docs/`. The Discord section that
  used to carry the prose contract is gone from the README, so links to it must point at
  `docs/DISCORD.md`.
- **Tests**: the Discord formatter spec, the mail client spec, and the five features
  asserting Discord message bodies carry the new name.
- **Not affected**: database, domain logic, event contracts, auth.
