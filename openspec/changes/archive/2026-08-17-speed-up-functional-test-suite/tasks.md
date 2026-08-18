## 1. Type-checking

- [x] 1.1 Switch `cucumber.js` to `ts-node/register/transpile-only`
- [x] 1.2 Add a `typecheck` script running `tsc --noEmit`

## 2. Token reuse

- [x] 2.1 Type `apiUsers` as `Record<ApiUserType, …>` and add the `Alan Doe` and `Michael Doe` seed users to the union
- [x] 2.2 Add the per-user token cache with an 8-minute reuse window and export `accessTokenFor`
- [x] 2.3 Replace the token map and its `currentRole` key with a single `bearerToken` variable, set directly by the Google sign-in step
- [x] 2.4 Use `accessTokenFor` from `websocket.context.ts` and delete its credentials map and sign-in helper

## 3. Runtime and pipeline

- [x] 3.1 Move the base image to `node:26-alpine` and `@types/node` to `^26`
- [x] 3.2 Deploy through `digitalocean/app_action/deploy@v2` against the `mypreflight` app, pinning the image tag to the version in `package.json` and printing build and deploy logs

## 4. Verification

- [x] 4.1 Run lint, format, `npm run typecheck` and the Jest unit suite
- [x] 4.2 Run the full functional suite on the new base image
