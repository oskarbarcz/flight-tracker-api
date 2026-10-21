# flight-tracker-api

The main API: flight lifecycle, briefing, SimBrief import, live position relay, the Discord bot and scheduled jobs, for the MyPreflight web app and the Transponder.

Last reviewed: 2026-10-21

This repo is part of MyPreflight. The knowledge base lives in the product repo, [mypreflight/product](https://github.com/mypreflight/product). It is the primary source of truth for product decisions, standards and architecture. Read it by URL before working here:

- Start: https://raw.githubusercontent.com/mypreflight/product/main/CLAUDE.md
- Standards: https://raw.githubusercontent.com/mypreflight/product/main/technology/backend/standards.md
- Architecture: https://raw.githubusercontent.com/mypreflight/product/main/technology/backend/architecture.md

If this file or the code contradicts the knowledge base, the knowledge base takes precedence. Flag the conflict; don't silently change either side.

## Repo-specific notes

Keep this short. Anything shared between repos belongs in the knowledge base.

- Run locally: `cp .env.dist .env`, then `docker compose up -d --build`. Packages, database schema and seed data are set up automatically. API docs are at <http://localhost/api>.
- Test: `docker compose exec app npm run format`, then `npm run lint` and `npm run test:functional` (cucumber-js, `features/`) the same way. These are the steps CI runs.
- Deploy: bump `package.json` `version` in every PR. Merging to `main` tags the version, pushes the image to GitHub Container Registry and deploys it to DigitalOcean.

When your change alters product behaviour, also open a PR to the knowledge base updating the matching file.
