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
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "38644393-deee-434d-bfd1-7242abdbc4e1"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close" with body:
      """json
      {
        "actualFuelBurned": 10.2
      }
      """
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
            "blockFuel": 12.7,
            "fuel": {
              "block": 12.7,
              "taxi": 0.3,
              "trip": 10.4,
              "alternate": 0.9,
              "reserve": 0.6,
              "contingencyType": "5%",
              "contingencyAmount": 0.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0,
              "extra": 0,
              "tankering": 0
            }
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
            "blockFuel": 11.9,
            "fuel": {
              "block": 11.9,
              "taxi": 0.3,
              "trip": 9.8,
              "alternate": 0.9,
              "reserve": 0.6,
              "contingencyType": "5%",
              "contingencyAmount": 0.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0,
              "extra": 0,
              "tankering": 0
            }
          }
        },
        "aircraft": {
          "id": "69811511-fa34-4837-ab5d-dd480aeab8b6",
          "airframe": {
            "type": "B77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "N727AN",
          "selcal": "AB-FG",
          "livery": "Heritage America West (2022)",
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
            "type": "departure",
            "shape": "@coordinates"
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
            },
            "shape": "@coordinates"
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
            "type": "destination_alternate",
            "shape": "@coordinates"
          }
        ],
        "departureParkingPositionId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": true,
        "isOffBlockDelayed": true,
        "actualFuelBurned": 10.2,
        "source": "manual",
        "tracking": "public",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270",
          "totalFlightTime": 2391
        }
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
          "id": "cc6fdbb4-0533-40d2-a313-8b0e5145a605",
          "scope": "user",
          "type": "flight.live-position-received",
          "payload": {},
          "actor": null,
          "createdAt": "2025-01-01T12:01:00.000Z"
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
        "homeAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "lastAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "lastAirportUpdatedAt": null
      }
      """
    When I send a "GET" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/aircraft/69811511-fa34-4837-ab5d-dd480aeab8b6"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "69811511-fa34-4837-ab5d-dd480aeab8b6",
        "airframe": {
          "type": "B77W",
          "name": "Boeing 777-300ER",
          "cruiseSpeed": { "value": 0.84, "unit": "mach" },
          "serviceCeiling": 43000,
          "performanceCode": "D",
          "weightCategory": "heavy"
        },
        "livery": "Heritage America West (2022)",
        "registration": "N727AN",
        "selcal": "AB-FG",
        "currentState": "idle",
        "etopsThresholdMinutes": null,
        "baseAirport": {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "iataCode": "JFK",
          "name": "New York JFK",
          "city": "New York",
          "country": "United States of America",
          "location": "@coordinates"
        },
        "lastAirport": {
          "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
          "iataCode": "PHL",
          "name": "Philadelphia Intl",
          "city": "Philadelphia",
          "country": "United States of America",
          "location": "@coordinates"
        },
        "lastAirportUpdatedAt": "2025-01-01T16:28:00.000Z",
        "lastParkingPosition": null
      }
      """
    And I should receive a live flight event of type "flight.closed" within 2000ms
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

  Scenario: As a cabin crew I cannot close flight with an unresolved emergency
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/5f2c6e3d-9b4a-4d18-8e72-1a3c9f5b8d04/close"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Cannot close flight with an unresolved emergency.",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As a cabin crew I can close flight after resolving its outstanding emergency
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "5f2c6e3d-9b4a-4d18-8e72-1a3c9f5b8d04"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/5f2c6e3d-9b4a-4d18-8e72-1a3c9f5b8d04/close"
    Then the response status should be 400
    When I send a "DELETE" request to "/api/v1/flight/5f2c6e3d-9b4a-4d18-8e72-1a3c9f5b8d04/emergency/aa18ec01-1bf2-4d65-8c43-92ef10ea7311"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/5f2c6e3d-9b4a-4d18-8e72-1a3c9f5b8d04/close"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/5f2c6e3d-9b4a-4d18-8e72-1a3c9f5b8d04"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "5f2c6e3d-9b4a-4d18-8e72-1a3c9f5b8d04",
        "flightNumber": "AA4918",
        "callsign": "AAL4918",
        "atcCallsign": "AAL18J",
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
            "flightCrew": { "pilots": 2, "reliefPilots": 0, "cabinCrew": 6 },
            "passengers": 358,
            "payload": 39.7,
            "cargo": 8.2,
            "zeroFuelWeight": 208.1,
            "blockFuel": 12.5,
            "fuel": {
              "block": 12.5,
              "taxi": 0.3,
              "trip": 10.2,
              "alternate": 0.9,
              "reserve": 0.6,
              "contingencyType": "5%",
              "contingencyAmount": 0.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0,
              "extra": 0,
              "tankering": 0
            }
          },
          "final": {
            "flightCrew": { "pilots": 2, "reliefPilots": 0, "cabinCrew": 6 },
            "passengers": 354,
            "payload": 27.8,
            "cargo": 8.6,
            "zeroFuelWeight": 202.1,
            "blockFuel": 11.7,
            "fuel": {
              "block": 11.7,
              "taxi": 0.3,
              "trip": 9.4,
              "alternate": 0.9,
              "reserve": 0.6,
              "contingencyType": "5%",
              "contingencyAmount": 0.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0,
              "extra": 0,
              "tankering": 0
            }
          }
        },
        "aircraft": {
          "id": "7e059d96-260c-44e3-a08c-a216cb76398b",
          "airframe": {
            "type": "B77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "N729AN",
          "selcal": "AC-DF",
          "livery": "Breast Cancer Awareness (2022)",
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
            "location": { "longitude": -71.01663, "latitude": 42.36454 },
            "type": "departure",
            "shape": "@coordinates"
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
            "location": { "longitude": -75.24349, "latitude": 39.87113 },
            "shape": "@coordinates"
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
            "location": { "longitude": -73.7781, "latitude": 40.6413 },
            "type": "destination_alternate",
            "shape": "@coordinates"
          }
        ],
        "departureParkingPositionId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "manual",
        "tracking": "public",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270",
          "totalFlightTime": 2391
        }
      }
      """
    When I send a "GET" request to "/api/v1/flight/5f2c6e3d-9b4a-4d18-8e72-1a3c9f5b8d04/emergency"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "aa18ec01-1bf2-4d65-8c43-92ef10ea7311",
          "urgency": "panpan",
          "threatLevel": "high",
          "category": "medical-emergency",
          "squawk": "7700",
          "intention": "immediate-landing",
          "lastKnownPosition": { "longitude": -73.42, "latitude": 41.08 },
          "soulsOnBoard": 362,
          "fuelEnduranceMinutes": 95,
          "dangerousGoodsOnBoard": [],
          "freeText": "Passenger in seat 24B suffering suspected cardiac arrest. CPR in progress, requesting priority handling and medical team at gate.",
          "declarationTime": "2025-01-01T14:35:00.000Z",
          "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "resolvedAt": "@date('within 1 minute from now')",
          "resolvedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" }
        }
      ]
      """
    And I should receive a live flight event of type "flight.closed" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I can close flight whose emergency was already resolved in flight
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "7d8a3c91-5e62-4b41-9c08-2f6b1d7e3a45"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/7d8a3c91-5e62-4b41-9c08-2f6b1d7e3a45/close"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/7d8a3c91-5e62-4b41-9c08-2f6b1d7e3a45"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "7d8a3c91-5e62-4b41-9c08-2f6b1d7e3a45",
        "flightNumber": "AA4919",
        "callsign": "AAL4919",
        "atcCallsign": "AAL19J",
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
            "flightCrew": { "pilots": 2, "reliefPilots": 0, "cabinCrew": 6 },
            "passengers": 341,
            "payload": 38.6,
            "cargo": 7.9,
            "zeroFuelWeight": 207.0,
            "blockFuel": 12.4,
            "fuel": {
              "block": 12.4,
              "taxi": 0.3,
              "trip": 10.1,
              "alternate": 0.9,
              "reserve": 0.6,
              "contingencyType": "5%",
              "contingencyAmount": 0.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0,
              "extra": 0,
              "tankering": 0
            }
          },
          "final": {
            "flightCrew": { "pilots": 2, "reliefPilots": 0, "cabinCrew": 6 },
            "passengers": 339,
            "payload": 27.4,
            "cargo": 8.2,
            "zeroFuelWeight": 201.4,
            "blockFuel": 11.6,
            "fuel": {
              "block": 11.6,
              "taxi": 0.3,
              "trip": 9.3,
              "alternate": 0.9,
              "reserve": 0.6,
              "contingencyType": "5%",
              "contingencyAmount": 0.5,
              "mel": 0,
              "atc": 0,
              "wxx": 0,
              "extra": 0,
              "tankering": 0
            }
          }
        },
        "aircraft": {
          "id": "b0ea1829-61ea-4b50-8bf6-bfccfb4fe5c7",
          "airframe": {
            "type": "B77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "N730AN",
          "selcal": "AC-DG",
          "livery": "50th Anniversary (2024)",
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
            "location": { "longitude": -71.01663, "latitude": 42.36454 },
            "type": "departure",
            "shape": "@coordinates"
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
            "location": { "longitude": -75.24349, "latitude": 39.87113 },
            "shape": "@coordinates"
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
            "location": { "longitude": -73.7781, "latitude": 40.6413 },
            "type": "destination_alternate",
            "shape": "@coordinates"
          }
        ],
        "departureParkingPositionId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalParkingPositionId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "manual",
        "tracking": "public",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270",
          "totalFlightTime": 2391
        }
      }
      """
    And I should receive a live flight event of type "flight.closed" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I can close flight whose delay allocation is fully settled
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/delay"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "9d54d8d3-ae4f-4fa4-b4c3-91d12891c81f",
        "flightId": "38644393-deee-434d-bfd1-7242abdbc4e1",
        "totalDelayMinutes": 10,
        "allocatedMinutes": 10,
        "isReconciled": true,
        "isSettled": true,
        "reports": [
          {
            "id": "4ccb028e-51f5-4d80-9c83-1ab1b3b13c30",
            "delayMinutes": 6,
            "reasonCode": "RLL",
            "freeText": null,
            "rejectionReason": null,
            "status": "accepted",
            "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
            "decidedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
            "decidedAt": "2025-01-01T13:20:00.000Z",
            "createdAt": "2025-01-01T13:16:00.000Z"
          },
          {
            "id": "800243c5-0c77-4ace-b4cb-5b2ff499a1c1",
            "delayMinutes": 4,
            "reasonCode": "ATZ",
            "freeText": null,
            "rejectionReason": null,
            "status": "accepted",
            "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
            "decidedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
            "decidedAt": "2025-01-01T13:21:00.000Z",
            "createdAt": "2025-01-01T13:17:00.000Z"
          }
        ],
        "createdAt": "2025-01-01T13:15:00.000Z"
      }
      """
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close"
    Then the response status should be 204
    And I set database to initial state

  Scenario: As a cabin crew I cannot close flight while it has an unaccepted delay report
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/delay" with body:
      """json
      {
        "delayMinutes": 3,
        "reasonCode": "OTH"
      }
      """
    Then the response status should be 201
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/close"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot close flight: its delay must be fully allocated and every report accepted."
      }
      """
    And I set database to initial state
