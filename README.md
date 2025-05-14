![My Project Header](.github/image/header.png)

# Flight Tracker

A comprehensive web app for scheduling and tracking flights in a flight simulator environment. Designed for virtual
aviation enthusiasts, it enables seamless management of flights, aircraft, airports, crews, and passengers.

With this app, you can:

- Plan & manage flights with detailed flight plans
- Track flights step-by-step from departure to arrival
- Generate timesheets & loadsheets for accurate record-keeping
- Monitor aircraft status and optimize resource allocation

Take full control of your virtual airline operations with a realistic and structured workflow for flight simulation

This is server part of the project. For client part, please visit
[this repository](https://github.com/oskarbarcz/flight-tracker-app).

## Repository contents

Repository contains server code for [Flight Tracker](https://flights.barcz.me) app.

Project is using **Node.js** and **TypeScript** in versions listed below:

| Technology | Version |
| ---------- | ------- |
| Node.js    | 24      |
| TypeScript | ^5.8    |

Main dependencies are **Nest.js** and **Prisma ORM** in versions listed below.

| Vendor  | Version |
| ------- | ------- |
| Nest.js | ^10.4   |
| Prisma  | ^6.3.1  |

## Getting Started

### Environment

This app uses docker-based virtualization to run. In order to set up project, follow these steps:

1. Clone project by running:

```shell
git@github.com:oskarbarcz/flight-tracker-api.git
```

2. Prepare environment variable file by copying `.env.example` to `.env` and fill it with your data.

```shell
cd flight-tracker-api
cp .env.dist .env
```

3. Use docker compose to set up the environment

```shell

docker compose up -d --build
```

Packages, database schema, seed data will be configured automatically.

4. Your project should be up and running. Open browser and go to [http://localhost/api](http://localhost/api) to see the
   api documentation.

Default credentials for the API are:

| Role       | Username               | Password |
| ---------- | ---------------------- | -------- |
| Cabin crew | cabin-crew@example.com | P@$$w0rd |
| Operations | operations@example.com | P@$$w0rd |
| Admin      | admin@example.com      | P@$$w0rd |

### Generating certs

Application has by default configured EC certificates. However, if you want to create custom ones, use the command
below:

```shell
openssl ecparam -genkey -name prime256v1 -noout -out private.key
openssl ec -in private.key -pubout -out public.key
```

## Build, Test and Deploy

This project uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

This project has configured continuous integration and continuous deployment pipelines. It uses GitHub Actions to
automatically build, test and deploy the app to the DigitalOcean. You can find the configuration in `.github/workflows`
directory.

## License

This projects adapts UNLICENSE. For more information, please visit [UNLICENSE](UNLICENSE) file.

## Disclaimer

I am experienced software engineer, but I am not connected anyhow with airline industry. This project is created for
educational purposes only and should not be used for real-world aviation operations.
