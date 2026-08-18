## 1. Build context

- [x] 1.1 Add `.dockerignore` covering dependency and build output, version control and CI metadata, the local `.env` and `test-data/`, editor and agent material, and Docker's own inputs

## 2. Dependency install

- [x] 2.1 Add a `deps` stage copying only `package*.json` and installing with a BuildKit npm cache mount and `--prefer-offline --no-audit --fund=false`
- [x] 2.2 Drop the install from the `development` stage, which installs at runtime against the bind-mounted `node_modules`
- [x] 2.3 Take `node_modules` from `deps` in the `build` stage
- [x] 2.4 Replace the second `npm ci --omit=dev` with `npm prune --omit=dev` after `prisma generate` and `npm run build`

## 3. Verification

- [x] 3.1 Rebuild the stack and confirm the dev container still installs, generates, migrates and seeds
- [x] 3.2 Run the full functional suite against the rebuilt image
