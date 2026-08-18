## 1. User-facing copy

- [x] 1.1 Rename the product in `src/modules/flights/model/discord-message.formatter.ts` (`MyPreflight app` and the map link label) and update its colocated spec
- [x] 1.2 Rename it in the email-change and password-reset mail listeners, and in the listener specs quoting them
- [x] 1.3 Set the Swagger title to `MyPreflight API`
- [x] 1.4 Update the five `.feature` files asserting Discord message bodies

## 2. Domain move

- [x] 2.1 Point the production CORS origin at `https://mypreflight.io`
- [x] 2.2 Point the Helmet CSP connect target at the same host
- [x] 2.3 Add `https://api.mypreflight.io` as the documented production server and set `homepage` in `package.json`
- [x] 2.4 Update `MAIL_FROM_ADDRESS` and `DISCORD_OAUTH_REDIRECT_URIS` in `.env.dist`, and update both in the deployed environments

## 3. Documentation

- [x] 3.1 Rewrite `README.md` as a product-facing document with the new header image
- [x] 3.2 Move the Discord contract to `docs/DISCORD.md`, the email behaviour to `docs/EMAILS.md`, and the WebSocket protocol to `docs/WEBSOCKETS.md`

## 4. Pipelines

- [x] 4.1 Split `integrity.yaml` into a `files` job (CRLF, file permissions, version uniqueness via the shared actions) and a `code` job, and drop the Markdown `paths` filter
- [x] 4.2 Delete `docker/ci/check_version_is_free`, now covered by the shared version action
- [x] 4.3 Move both workflows to `actions/checkout@v7`, current action versions and `ubuntu-latest`, and rename the image-publishing environment from `ghcr` to `image`

## 5. Verification

- [x] 5.1 Run lint, format and the Jest unit suite
- [x] 5.2 Run the affected Discord features, then the full functional suite
- [x] 5.3 Confirm both workflows pass on the pull request
