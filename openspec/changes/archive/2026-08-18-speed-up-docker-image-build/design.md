## Context

See `proposal.md` § Why for motivation. This change has no delta specs: nothing observable to
a client changes.

Three pieces of current state shape the approach:

**The dev container installs at runtime.** `docker/dev/entrypoint` runs `npm install`,
`prisma generate`, migrate, seed and `start:dev`, against a bind-mounted `./node_modules`.
The development image therefore does not need a baked dependency tree at all — what it needs
is to not fight the mount.

**The production tree was built by a second install.** The build stage ran
`npm ci --omit=dev` after the development stage had already installed everything, so the same
packages were resolved and downloaded twice per production build.

**The context was the whole working tree.** With no `.dockerignore`, `COPY . .` picked up
`node_modules` (host-architecture binaries, useless and heavy), `dist`, `.git`, `test-data`
written by the functional suite, and the local `.env`.

## Goals / Non-Goals

**Goals:**

- One install per build, cached on the only inputs that should invalidate it.
- A build context that contains what the image needs and nothing else.
- Keep secrets and test artefacts out of every layer.

**Non-Goals:**

- Shrinking the runtime image beyond what dropping the development dependencies achieves.
- Changing how the dev container installs at runtime, or the bind mounts in `compose.yaml`.
- A registry-backed build cache. The local cache mount plus a stable context is the cheap
  win; remote caching can follow if it is ever needed.

## Decisions

### A dedicated `deps` stage copying only `package*.json`

`FROM alpine-node-base AS deps` copies the manifest and lockfile, installs, and is consumed
by the build stage via `COPY --from=deps /app/node_modules`.

_Why:_ the install layer's cache key becomes the two files that actually determine the tree.
Previously it included `prisma/`, so editing `schema.prisma` — a routine change — reinstalled
everything.

_Why the development stage no longer installs:_ it copies the source and hands over to the
entrypoint, which installs against the bind-mounted `node_modules` anyway. A baked tree there
was work whose result was immediately shadowed by the mount.

### The npm cache is a BuildKit cache mount, shared with a lock

`RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci --prefer-offline --no-audit --fund=false`

_Why:_ when the lockfile does change, the packages that did not change are already in the
cache, so the install is a local copy rather than a download. `sharing=locked` serialises
concurrent builds so two of them cannot corrupt the cache. `--prefer-offline` is what makes
the mount pay off; `--no-audit` and `--fund=false` remove two network round trips whose output
nobody reads in a build.

_Consequence:_ the cache lives on the builder, not in the image, so it costs nothing in
layer size and disappears with the builder.

### The production tree is pruned, not reinstalled

`ENV NODE_ENV="production"` then `RUN npm prune --omit=dev` in the build stage, after
`prisma generate` and `npm run build` have used the development dependencies.

_Why:_ the tree is already correct — it just contains more than production needs. Pruning
removes the development packages in place instead of resolving and downloading the production
set a second time. It also keeps one lockfile resolution behind both the build and the
runtime tree, so the packages tested are the packages shipped.

_Ordering matters:_ pruning has to come after the build, since the compiler and the Prisma
CLI are development dependencies.

### `.dockerignore` names categories, with reasons

Grouped and commented: dependency and build output, version control and CI, local runtime
state and secrets, editor and agent material, Docker's own inputs.

_Why exclude `node_modules` explicitly_ even though the stages no longer copy it into the
install path: it is the largest thing in the context, it holds host-architecture binaries and
Prisma engines that would break inside the image, and its mere presence in the context
invalidates cache on every local install.

_Why exclude `.env`:_ it holds real local secrets, and `COPY . .` would bake them into a
layer that is pushed to the registry.

_Why exclude `openspec/`, `.claude/` and `CLAUDE.md`:_ planning and agent material has no
runtime role, and it changes often — exactly the profile that ruins a build cache.

## Risks / Trade-offs

**BuildKit becomes a requirement** → the cache mount is not understood by the legacy builder.
Current Docker uses BuildKit by default and the CI runners do too, so the practical cost is a
clear failure on a very old Docker rather than a subtle one.

**An over-broad ignore can break a build silently** → a path the image genuinely needs would
show up as a missing file at build time, not at runtime, so the failure mode is loud. The
functional suite running against a rebuilt image is what confirms it.

**`npm prune` trusts the installed tree** → if a development dependency were also a runtime
dependency but declared only in `devDependencies`, pruning would remove it, where a fresh
`npm ci --omit=dev` would have failed at install. Both end in a broken image; the prune version
fails at first run rather than at build.

## Migration Plan

1. Add `.dockerignore`.
2. Split the `deps` stage out, remove the install from the development stage, and switch the
   build stage to `npm prune --omit=dev`.
3. Rebuild the stack locally and run the functional suite against the rebuilt image.

**Rollback:** revert both files. No state, no data, no configuration outside the repository.
