## Why

Every CI run and every local `docker compose up --build` reinstalled the whole dependency
tree, and there were two reasons for it.

The repository had no `.dockerignore`, so the build context was the working tree — including
`node_modules`, `dist`, `.git`, `test-data`, the local `.env` and the agent and planning
directories. Sending that context is slow on its own, and because the context is part of the
cache key, touching any of those paths invalidated the layers that follow. A test run that
wrote a file under `test-data/` was enough to trigger a fresh install.

The install itself also ran twice for a production image. The development stage ran
`npm ci` after copying `prisma/`, so an unrelated schema edit invalidated the install layer,
and the build stage then ran a second `npm ci --omit=dev` from scratch to get a production
tree — downloading every production dependency again rather than removing the development
ones from the tree it already had.

Shipping the local `.env` into the image was also a straightforward mistake: secrets in a
layer that gets pushed to the registry.

## What Changes

- Add a `.dockerignore` excluding what the image never needs: `node_modules` and `dist`
  (installed or built inside the image and bind-mounted at runtime), version control and CI
  metadata, the local `.env` and `test-data/`, editor, agent and planning directories, and
  Docker's own inputs.
- Install dependencies once, in a dedicated `deps` stage that copies only `package*.json`, so
  the install layer is invalidated by a dependency change and by nothing else.
- Mount npm's cache into that install with a BuildKit cache mount, so a rebuild after a
  dependency change reuses what was already downloaded.
- Run `npm ci` with `--prefer-offline --no-audit --fund=false`: use the mounted cache in
  preference to the network, and skip the audit and funding round trips that a build does not
  need.
- Derive the production tree with `npm prune --omit=dev` from the tree already installed,
  replacing the second full install.

## Capabilities

### Modified Capabilities

- _None._ Build tooling only: the resulting images run the same application from the same
  sources.

## Impact

- **CI**: a smaller context to upload, and installs that survive edits to anything except
  `package.json` or `package-lock.json`.
- **Security**: the local `.env` and `test-data/` are no longer copied into any image layer.
- **Image**: `.dockerignore`, three stages of `Dockerfile`. Runtime contents unchanged.
- **Requires BuildKit** for the cache mount — the default in current Docker and in the CI
  runners.
- **Local development**: the bind-mounted `node_modules` still governs what the dev container
  runs, so the entrypoint's install behaviour is unchanged.
- **Not affected**: application code, database, API surface.
