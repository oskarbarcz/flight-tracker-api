Feature: Close flight

  Scenario: As an admin I cannot close flight for flight that finished offboarding
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot close flight for flight that finished offboarding
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I can close flight for flight that finished offboarding
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "38644393-deee-434d-bfd1-7242abdbc4e1",
        "flightNumber": "AA4916",
        "callsign": "AAL4916",
        "atcCallsign": "AAL16J",
        "isEtops": false,
        "status": "closed",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          },
          "estimated": {
            "arrivalTime": "2025-01-01T15:50:00.000Z",
            "onBlockTime": "2025-01-01T16:08:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          },
          "actual": {
            "arrivalTime": "2025-01-01T16:10:00.000Z",
            "onBlockTime": "2025-01-01T16:28:00.000Z",
            "takeoffTime": "2025-01-01T13:25:00.000Z",
            "offBlockTime": "2025-01-01T13:10:00.000Z"
          }
        },
        "loadsheets": {
          "preliminary": {
            "flightCrew": {
              "pilots": 2,
              "reliefPilots": 0,
              "cabinCrew": 6
            },
            "passengers": 370,
            "payload": 40.3,
            "cargo": 8.5,
            "zeroFuelWeight": 208.9,
            "blockFuel": 12.7
          },
          "final": {
            "flightCrew": {
              "pilots": 2,
              "reliefPilots": 0,
              "cabinCrew": 6
            },
            "passengers": 366,
            "payload": 28.3,
            "cargo": 8.9,
            "zeroFuelWeight": 202.9,
            "blockFuel": 11.9
          }
        },
        "aircraft": {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "icaoCode": "B77W",
          "shortName": "Boeing 777",
          "fullName": "Boeing 777-300ER",
          "registration": "N78881",
          "selcal": "KY-JO",
          "livery": "Team USA (2023)",
          "operator": {
            "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
            "icaoCode": "AAL",
            "iataCode": "AA",
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "iataCode": "AA",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN"
        },
        "airports": [
          {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "icaoCode": "KBOS",
            "iataCode": "BOS",
            "city": "Boston",
            "name": "Boston Logan Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "location": {
              "longitude": -71.01663,
              "latitude": 42.36454
            },
            "type": "departure"
          },
          {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "icaoCode": "KPHL",
            "iataCode": "PHL",
            "city": "Philadelphia",
            "name": "Philadelphia Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "type": "destination",
            "continent": "north_america",
            "location": {
              "longitude": -75.24349,
              "latitude": 39.87113
            }
          },
          {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "icaoCode": "KJFK",
            "iataCode": "JFK",
            "city": "New York",
            "name": "New York JFK",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "location": {
              "longitude": -73.7781,
              "latitude": 40.6413
            },
            "type": "destination_alternate"
          }
        ],
        "isFlightDiverted": false,
        "source": "manual",
        "tracking": "public",
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    When I send a "GET" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "299705bd-4cdc-462f-941e-907061a530d9",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "b5242b30-ac97-4014-9000-05773ed394a4",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "083304c4-85be-4ebf-9c2d-757b714a23f7",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "346e6985-299c-49b3-9c76-6ee5ee679e43",
          "scope": "user",
          "type": "flight.pilot-checked-in",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T12:00:00.000Z"
        },
        {
          "id": "975140bc-8cac-4587-bddd-0a7acfb7a15f",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T12:40:00.000Z"
        },
        {
          "id": "69b9a8a4-781c-44e9-8430-3fdd434def23",
          "scope": "user",
          "type": "flight.boarding-finished",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T13:05:00.000Z"
        },
        {
          "id": "be8c9559-0273-4f04-b480-062628bb670d",
          "scope": "user",
          "type": "flight.off-block-reported",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T13:10:00.000Z"
        },
        {
          "id": "e9f6ea80-395a-4859-a7c3-2bd93fc16066",
          "scope": "user",
          "type": "flight.takeoff-reported",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T13:25:00.000Z"
        },
        {
          "id": "e342f02c-b0b5-4921-8ae3-51a28ee2bdd8",
          "scope": "user",
          "type": "flight.arrival-reported",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T16:10:00.000Z"
        },
        {
          "id": "beb79715-d10d-49b3-acab-e96d9e0f37a8",
          "scope": "user",
          "type": "flight.on-block-reported",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T16:28:00.000Z"
        },
        {
          "id": "a9e2c75c-c22a-41ab-bc00-8602f7f373ed",
          "scope": "user",
          "type": "flight.offboarding-started",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T16:30:00.000Z"
        },
        {
          "id": "fbe0b258-8e73-419d-abde-1194ca15944d",
          "scope": "user",
          "type": "flight.offboarding-finished",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "2025-01-01T16:50:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.closed",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/fcf6f4bc-290d-43a9-843c-409cd47e143d"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Doe",
        "email": "cabin-crew@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-31270",
        "currentFlightId": null,
        "currentRotationId": null
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I close flight for flight that finished offboarding and is last in rotation
    Given I am signed in as "Michael Doe"
    When I send a "POST" request to "/api/v1/flight/d4a25ef2-39cf-484c-af00-a548999e8699/close"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/d4a25ef2-39cf-484c-af00-a548999e8699"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "d4a25ef2-39cf-484c-af00-a548999e8699",
        "flightNumber": "LH43",
        "callsign": "DLH43",
        "atcCallsign": null,
        "isEtops": true,
        "status": "closed",
        "timesheet": {
          "actual": {
            "arrivalTime": "2025-01-03T11:30:00.000Z",
            "onBlockTime": "2025-01-03T11:45:00.000Z",
            "takeoffTime": "2025-01-03T04:20:00.000Z",
            "offBlockTime": "2025-01-03T04:00:00.000Z"
          },
          "estimated": {
            "arrivalTime": "2025-01-03T11:30:00.000Z",
            "onBlockTime": "2025-01-03T11:45:00.000Z",
            "takeoffTime": "2025-01-03T04:20:00.000Z",
            "offBlockTime": "2025-01-03T04:00:00.000Z"
          },
          "scheduled": {
            "arrivalTime": "2025-01-03T11:30:00.000Z",
            "onBlockTime": "2025-01-03T11:45:00.000Z",
            "takeoffTime": "2025-01-03T04:20:00.000Z",
            "offBlockTime": "2025-01-03T04:00:00.000Z"
          }
        },
        "loadsheets": {
          "final": null,
          "preliminary": {
            "cargo": 8.4,
            "payload": 34.9,
            "blockFuel": 47.9,
            "flightCrew": {
              "pilots": 2,
              "cabinCrew": 12,
              "reliefPilots": 1
            },
            "passengers": 335,
            "zeroFuelWeight": 162.3
          }
        },
        "aircraft": {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "icaoCode": "A339",
          "shortName": "Airbus A330",
          "fullName": "Airbus A330-900 neo",
          "registration": "D-AIMC",
          "selcal": "LR-CK",
          "livery": "Fanhansa (2024)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          }
        },
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
        },
        "airports": [
          {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "icaoCode": "KJFK",
            "iataCode": "JFK",
            "city": "New York",
            "name": "New York JFK",
            "country": "United States of America",
            "timezone": "America/New_York",
            "continent": "north_america",
            "location": {
              "latitude": 40.6413,
              "longitude": -73.7781
            },
            "type": "departure"
          },
          {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "city": "Frankfurt",
            "name": "Frankfurt Rhein/Main",
            "country": "Germany",
            "timezone": "Europe/Berlin",
            "continent": "europe",
            "location": {
              "latitude": 50.04693,
              "longitude": 8.57397
            },
            "type": "destination"
          },
          {
            "id": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
            "icaoCode": "EDDW",
            "iataCode": "BRE",
            "city": "Bremen",
            "name": "Bremen",
            "country": "Germany",
            "timezone": "Europe/Berlin",
            "continent": "europe",
            "location": {
              "latitude": 53.0475,
              "longitude": 8.786667
            },
            "type": "destination_alternate"
          },
          {
            "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
            "icaoCode": "BIKF",
            "iataCode": "KEF",
            "city": "Reykjavik",
            "name": "Reykjavik Keflavik",
            "country": "Iceland",
            "timezone": "Atlantic/Reykjavik",
            "continent": "europe",
            "location": {
              "latitude": 64.13,
              "longitude": -21.9406
            },
            "type": "etops_alternate"
          },
          {
            "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
            "icaoCode": "CYYT",
            "iataCode": "YYT",
            "city": "St. Johns",
            "name": "St. Johns Intl",
            "country": "Canada",
            "timezone": "America/St_Johns",
            "continent": "north_america",
            "location": {
              "latitude": 47.61861,
              "longitude": -52.751945
            },
            "type": "etops_alternate"
          }
        ],
        "isFlightDiverted": false,
        "source": "manual",
        "tracking": "private",
        "rotationId": "c2e12afb-a712-45aa-9ba5-fec71868e59a",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    When I send a "GET" request to "/api/v1/flight/d4a25ef2-39cf-484c-af00-a548999e8699/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "865a28a4-5154-4e35-a6d4-e198a1ceaa31",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "2b2cecc3-6af9-4335-9029-873c6da142c5",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "8505951b-9fdd-4262-8460-248039f8e7cd",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "c8f5dd49-03f7-4656-8976-8907175c0017",
          "scope": "user",
          "type": "flight.pilot-checked-in",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "2025-01-01T12:00:00.000Z"
        },
        {
          "id": "eaf13533-5aef-4451-aeea-82152deda67d",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "2025-01-01T12:40:00.000Z"
        },
        {
          "id": "7d337c5c-6a9b-4d6c-bd87-319706ea55d4",
          "scope": "user",
          "type": "flight.boarding-finished",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "2025-01-01T13:05:00.000Z"
        },
        {
          "id": "30e6a5bb-8945-44ca-b6dc-537155c24287",
          "scope": "user",
          "type": "flight.off-block-reported",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "2025-01-01T13:10:00.000Z"
        },
        {
          "id": "0c1703d9-af9b-49f7-9a7a-26ff6cd53e36",
          "scope": "user",
          "type": "flight.takeoff-reported",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "2025-01-01T13:25:00.000Z"
        },
        {
          "id": "8fa22b88-71db-40c9-90ed-0525d35c4af2",
          "scope": "user",
          "type": "flight.arrival-reported",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "2025-01-01T16:10:00.000Z"
        },
        {
          "id": "9fb04dc3-062b-4f68-a2f3-a35a5e76e272",
          "scope": "user",
          "type": "flight.on-block-reported",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "2025-01-01T16:28:00.000Z"
        },
        {
          "id": "bd5ae37a-2efe-4ca9-83c9-6ed6e9218fad",
          "scope": "user",
          "type": "flight.offboarding-started",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "2025-01-01T16:30:00.000Z"
        },
        {
          "id": "6391d61d-988a-43c2-abd0-49a9f6aa25a5",
          "scope": "user",
          "type": "flight.offboarding-finished",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "2025-01-01T16:50:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.closed",
          "payload": {},
          "actor": {
            "id": "629be07f-5e65-429a-9d69-d34b99185f50",
            "name": "Michael Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/629be07f-5e65-429a-9d69-d34b99185f50"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "629be07f-5e65-429a-9d69-d34b99185f50",
        "name": "Michael Doe",
        "email": "michael.doe@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-98540",
        "currentFlightId": null,
        "currentRotationId": null
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot close flight plan for flight twice
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot close flight that is not off boarded.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot close flight that not finished offboarding
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/5aada8ba-60c1-4e93-bcee-b59a7c555fdd/close"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot close flight that is not off boarded.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As a cabin crew I cannot close flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0ee4dec-b1fd-44aa-822c-28a7ead0191a/close"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot close flight with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/invalid-uuid/close"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot close a flight
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
