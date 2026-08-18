## Why

The Cucumber suite is the gate on every pull request, and two costs in it were paid over and
over for nothing.

The first was type-checking. `cucumber.js` loaded step definitions through
`ts-node/register`, which type-checks every context file on every run — including a full run
of the compiler over code the `code` job had already compiled a step earlier.

The second was signing in. `Given I am signed in as "…"` posted credentials to
`/api/v1/auth/sign-in` every time it ran, and it runs in almost every scenario of a suite
with hundreds of them. Each call cost a bcrypt verification plus a JWT signature, none of
which tests anything the sign-in feature does not already test. The WebSocket context made
it worse by carrying its own copy of the credentials and its own sign-in helper, so the two
contexts could drift on which users exist and what their passwords are.

The token map was also typed by assertion rather than by declaration — `apiTokens` was a
`Record<string, string>` holding a `currentRole` key alongside the tokens, and `apiUsers`
was cast to its type — so a user referenced by a feature file but missing from the union
failed at runtime instead of in the compiler.

## What Changes

- Run step definitions through `ts-node/register/transpile-only`, and add a `typecheck`
  script (`tsc --noEmit`) so the types are still checked, once, by whoever wants them
  checked rather than by every Cucumber run.
- Mint each test user's access token once and reuse it for 8 minutes, comfortably inside the
  15-minute token lifetime, so a reused token cannot expire mid-scenario. `Given I am signed
  in as "…"` becomes a lookup for all but the first scenario per user.
- Export the token helper and use it from the WebSocket context, deleting that context's
  duplicate credentials map and sign-in call.
- Replace the token map plus its `currentRole` entry with one `bearerToken` variable, since
  only the current actor's token is ever needed.
- Type the user table by declaration (`Record<ApiUserType, …>`) and add the two seeded users
  the presence features already referenced, so a missing user is a compile error.
- Move the base image to Node 26 and the `@types/node` dependency to match.
- Deploy through `digitalocean/app_action/deploy@v2` against the renamed `mypreflight`
  application, pinning the deployed image to the version in `package.json` and printing the
  build and deploy logs.

## Capabilities

### Modified Capabilities

- _None._ No product behaviour changes: this is test harness, tooling and pipeline work.
  The scenarios and the assertions they make are untouched.

## Impact

- **CI**: shorter functional runs, with type errors now surfacing from `npm run typecheck`
  instead of from the first Cucumber step that loads the offending file.
- **Tests**: `features/_context/rest-api.context.ts` and `features/_context/websocket.context.ts`.
  A scenario that depends on a freshly minted token must sign in explicitly rather than
  relying on the shared step.
- **Runtime**: Node 26 in every image stage.
- **Deployment**: the release job deploys the `mypreflight` app and pins the image tag, so a
  deploy can no longer pick up an image built by a later run.
- **Not affected**: application code, database, API surface.
