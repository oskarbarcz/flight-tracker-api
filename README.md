<div align="center">

[![oskar barcz / flight-tracker-api][banner]][homepage]

The backend service of [**MyPreflight**][homepage] platform. Serves the REST API and the live flight event stream that
the web app and the transponder companion run on.

</div>

## About

**MyPreflight** is a briefing service and electronic flight board app for your virtual flights, providing you realistic
figures, checklists, procedures and data to perform your flight like a real pilots do. You can customize your
experience, integrate with SimBrief and other tools. Check out our homepage at [mypreflight.io][homepage].

**This module** is the part running on our servers. It owns everything the clients only display:
- keeps the flight lifecycle — planning, check-in, boarding, off-block, airborne, on-block and closing,
- computes timesheets and loadsheets, and issues the briefing with the ATIS, METAR and TAF held for the departure,
- imports flight plans from SimBrief and airport, terminal and gate data curated from OpenStreetMap,
- receives live position from the transponder companion and republishes it to every subscribed client,
- delivers announcements and direct messages through the Discord bot.

The web app lives in [flight-tracker-app][repo-app] and the desktop companion in
[flight-tracker-transponder-app][repo-transponder].

[![integrity][ci-badge]][ci-url]
[![release][release-badge]][release-url]
[![license][license-badge]][license-url]

### Built with

[![TypeScript][ts-badge]][ts-url]
[![NestJS][nest-badge]][nest-url]
[![Node.js][node-shield]][node-url]
[![PostgreSQL][postgres-badge]][postgres-url]
[![Prisma][prisma-badge]][prisma-url]
[![Docker][docker-badge]][docker-url]

Commands and queries are separated with `@nestjs/cqrs`, every endpoint is a single action controller, and behaviour is
covered end-to-end with Cucumber.

## Getting started

### Environment

This app uses docker-based virtualization to run. To set up the project, follow these steps:

1. Clone the project by running:

   ```shell
   git clone git@github.com:oskarbarcz/flight-tracker-api.git
   ```

2. Prepare an environment variable file by copying `.env.dist` to `.env` and fill it with your data.

   ```shell
   cd flight-tracker-api
   cp .env.dist .env
   ```

3. Use docker compose to set up the environment

   ```shell
   docker compose up -d --build
   ```

   Packages, database schema, seed data will be configured automatically.

4. Your project should be up and running. Open the browser and go to [http://localhost/api](http://localhost/api) to see the
   api documentation.
   The seeded API users (all share the password `P@$$w0rd`) are:

   | Name        | Role       | Username                | Notes                                                                      |
   |-------------|------------|-------------------------|----------------------------------------------------------------------------|
   | John Doe    | Admin      | admin@example.com       |                                                                            |
   | Alice Doe   | Operations | operations@example.com  |                                                                            |
   | Abby Doe    | Operations | abby.doe@example.com    | SimBrief connected (valid flight plan)                                     |
   | Claudia Doe | Operations | claudia.doe@example.com | SimBrief connected (plan references unknown aircraft)                      |
   | Diana Doe   | Operations | diana.doe@example.com   | SimBrief connected (plan references unknown alternate)                     |
   | Rick Doe    | Cabin crew | cabin-crew@example.com  |                                                                            |
   | Alan Doe    | Cabin crew | alan.doe@example.com    |                                                                            |
   | Michael Doe | Cabin crew | michael.doe@example.com | Discord linked — receives briefing DMs                                     |
   | Grace Doe   | Operations | grace.doe@example.com   | Google-only — no password; Discord linked, so it cannot be unlinked either |

### Websockets

App is using Websockets for dynamic communication in the areas of flight tracking dashboard. Read more about websocket
implementation [in the dedicated document][docs-websockets].

### Email

Outbound email needs `MAILGUN_API_HOST`, `MAILGUN_DOMAIN`, `MAILGUN_API_KEY`, `MAIL_FROM_ADDRESS` and
`FRONTEND_BASE_URL` (the base URL that links in emails point at). `.env.dist` ships working development placeholders.

Only `NODE_ENV=production` sends anything. Everywhere else each message is written to
`test-data/mail/<type>_<recipient>_<uuid>.json` instead.

This app sends a few emails, read what they say and when they go out [in the dedicated document][docs-emails].

### Discord

This app integrates deeply with Discord, read more about it [in the dedicated document][docs-discord].

### Generating certs

Application has by default configured EC certificates. However, if you want to create custom ones, use the command
below:

```shell
openssl ecparam -genkey -name prime256v1 -noout -out private.key
openssl ec -in private.key -pubout -out public.key
```

## Build, test and deploy

This project uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

This project has configured continuous integration and continuous deployment pipelines. It uses GitHub Actions to
automatically build, test and deploy the app to the DigitalOcean. You can find the configuration in `.github/workflows`
directory.

## Contact

My name is Oskar, an experienced programmer, cybersecurity enthusiast, and conference speaker from Poland. Feel free to
contact me via the platforms below:

<div align="center">

[![LinkedIn][linkedin-badge]][linkedin-url]
[![GitHub][github-badge]][github-url]
[![Website][web-badge]][web-url]

</div>

## License

A public domain under the [Unlicense][license-url]. Do what you want with it. I am an experienced software engineer, but
I am not connected anyhow with the airline industry. This project is created for educational purposes only and should
not be used for real-world aviation operations.

[linkedin-badge]: https://img.shields.io/badge/Oskar%20Barcz-0A66C2?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI%2BPHBhdGggZD0iTTIwLjQ1IDIwLjQ1aC0zLjU1di01LjU3YzAtMS4zMy0uMDMtMy4wNC0xLjg1LTMuMDQtMS44NSAwLTIuMTQgMS40NS0yLjE0IDIuOTR2NS42N0g5LjM1VjloMy40MXYxLjU2aC4wNWMuNDgtLjkgMS42NC0xLjg1IDMuMzctMS44NSAzLjYgMCA0LjI3IDIuMzcgNC4yNyA1LjQ2djYuMjl6TTUuMzQgNy40M2MtMS4xNCAwLTIuMDYtLjkzLTIuMDYtMi4wNiAwLTEuMTQuOTItMi4wNiAyLjA2LTIuMDYgMS4xNCAwIDIuMDYuOTMgMi4wNiAyLjA2IDAgMS4xNC0uOTMgMi4wNi0yLjA2IDIuMDZ6bTEuNzggMTMuMDJIMy41NlY5aDMuNTZ2MTEuNDV6TTIyLjIzIDBIMS43N0MuNzkgMCAwIC43NyAwIDEuNzN2MjAuNTRDMCAyMy4yMy43OSAyNCAxLjc3IDI0aDIwLjQ1QzIzLjIgMjQgMjQgMjMuMjMgMjQgMjIuMjdWMS43M0MyNCAuNzcgMjMuMiAwIDIyLjIzIDB6Ii8%2BPC9zdmc%2B&logoColor=white
[linkedin-url]: https://www.linkedin.com/in/oskarbarcz
[github-badge]: https://img.shields.io/badge/@oskarbarcz-181717?style=for-the-badge&logo=github&logoColor=white
[github-url]: https://github.com/oskarbarcz
[web-badge]: https://img.shields.io/badge/barcz.me-4A5568?style=for-the-badge&logo=googlechrome&logoColor=white
[web-url]: https://barcz.me

[banner]: .github/image/background.png
[homepage]: https://mypreflight.io
[repo-app]: https://github.com/oskarbarcz/flight-tracker-app
[repo-transponder]: https://github.com/oskarbarcz/flight-tracker-transponder-app
[ci-badge]: https://img.shields.io/github/actions/workflow/status/oskarbarcz/flight-tracker-api/integrity.yaml?branch=main&style=for-the-badge&label=integrity
[ci-url]: https://github.com/oskarbarcz/flight-tracker-api/actions/workflows/integrity.yaml
[release-badge]: https://img.shields.io/github/v/release/oskarbarcz/flight-tracker-api?style=for-the-badge
[release-url]: https://github.com/oskarbarcz/flight-tracker-api/releases/latest
[license-badge]: https://img.shields.io/github/license/oskarbarcz/flight-tracker-api?style=for-the-badge
[license-url]: https://unlicense.org
[node-shield]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[node-url]: https://nodejs.org
[ts-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[ts-url]: https://www.typescriptlang.org
[nest-badge]: https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white
[nest-url]: https://nestjs.com
[postgres-badge]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[postgres-url]: https://www.postgresql.org
[prisma-badge]: https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
[prisma-url]: https://www.prisma.io
[docker-badge]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[docker-url]: https://www.docker.com
[docs-websockets]: docs/WEBSOCKETS.md
[docs-discord]: docs/DISCORD.md
[docs-emails]: docs/EMAILS.md
