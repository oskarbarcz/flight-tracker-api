Feature: Report on-block

  Scenario: As an admin I cannot report on-block
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2/report-on-block"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot report on-block
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2/report-on-block"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I can report on-block for flight that reported taxiing
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2/report-on-block"
    Then the response status should be 204
    And ADSB service was requested for callsign "AAL4913" and returned data:
      """json
      [
        {
          "callsign": "AAL4913",
          "date": "2025-01-01T13:10:00.000Z",
          "latitude": 42.3656,
          "longitude": -71.0096,
          "altitude": 8500,
          "verticalRate": 1800,
          "groundSpeed": 285,
          "track": 225,
          "isOnGround": false,
          "squawk": "2453",
          "alert": false,
          "emergency": false,
          "spi": false
        },
        {
          "callsign": "AAL4913",
          "date": "2025-01-01T13:40:00.000Z",
          "latitude": 41.7,
          "longitude": -72.3,
          "altitude": 24000,
          "verticalRate": 1500,
          "groundSpeed": 140,
          "track": 236,
          "isOnGround": false,
          "squawk": "2453",
          "alert": false,
          "emergency": false,
          "spi": false
        },
        {
          "callsign": "AAL4913",
          "date": "2025-01-01T14:10:00.000Z",
          "latitude": 40.7,
          "longitude": -74,
          "altitude": 35000,
          "verticalRate": 0,
          "groundSpeed": 195,
          "track": 233,
          "isOnGround": false,
          "squawk": "2453",
          "alert": false,
          "emergency": false,
          "spi": false
        },
        {
          "callsign": "AAL4913",
          "date": "2025-01-01T14:40:00.000Z",
          "latitude": 39.8729,
          "longitude": -75.2437,
          "altitude": 12000,
          "verticalRate": -1200,
          "groundSpeed": 151,
          "track": 229,
          "isOnGround": false,
          "squawk": "2453",
          "alert": false,
          "emergency": false,
          "spi": false
        }
      ]
      """
    When I send a "GET" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "04be266c-df78-4bec-9f50-281cc02ce7f2",
        "flightNumber": "AA4913",
        "callsign": "AAL4913",
        "status": "on_block",
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
            "onBlockTime": "@date('within 1 minute from now')",
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
            "shortName": "American Airlines",
            "fullName": "American Airlines, Inc.",
            "callsign": "AMERICAN"
          }
        },
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
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
        "tracking": "private",
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    When I send a "GET" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2/path"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "callsign": "AAL4913",
          "date": "2025-01-01T13:10:00.000Z",
          "latitude": 42.3656,
          "longitude": -71.0096,
          "altitude": 8500,
          "verticalRate": 1800,
          "groundSpeed": 285,
          "track": 225,
          "isOnGround": false,
          "squawk": "2453",
          "alert": false,
          "emergency": false,
          "spi": false
        },
        {
          "callsign": "AAL4913",
          "date": "2025-01-01T13:40:00.000Z",
          "latitude": 41.7,
          "longitude": -72.3,
          "altitude": 24000,
          "verticalRate": 1500,
          "groundSpeed": 140,
          "track": 236,
          "isOnGround": false,
          "squawk": "2453",
          "alert": false,
          "emergency": false,
          "spi": false
        },
        {
          "callsign": "AAL4913",
          "date": "2025-01-01T14:10:00.000Z",
          "latitude": 40.7,
          "longitude": -74,
          "altitude": 35000,
          "verticalRate": 0,
          "groundSpeed": 195,
          "track": 233,
          "isOnGround": false,
          "squawk": "2453",
          "alert": false,
          "emergency": false,
          "spi": false
        },
        {
          "callsign": "AAL4913",
          "date": "2025-01-01T14:40:00.000Z",
          "latitude": 39.8729,
          "longitude": -75.2437,
          "altitude": 12000,
          "verticalRate": -1200,
          "groundSpeed": 151,
          "track": 229,
          "isOnGround": false,
          "squawk": "2453",
          "alert": false,
          "emergency": false,
          "spi": false
        }
      ]
      """
    When I send a "GET" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "079f2632-c0ab-4dd1-9646-522b5c370fe5",
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
          "id": "dd8871ca-4d02-4b8f-910f-829fa78b9300",
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
          "id": "95d4986f-4211-4209-8479-deb63de7239f",
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
          "id": "2d5e21dd-b89d-4f40-bf8b-86317da51147",
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
          "id": "527def55-574b-4740-8876-c6af56e7c060",
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
          "id": "2a64d3fa-3615-4ced-a0ea-5d528f6e8cae",
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
          "id": "72655033-7a10-40d7-824b-5f20784f762d",
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
          "id": "e356f0df-f0a8-4c67-a7e9-8d1bdc3c5249",
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
          "id": "d6880a1e-4c04-49ca-ab15-7b04d7a4aac4",
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
          "id": "@uuid",
          "scope": "user",
          "type": "flight.on-block-reported",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I see Discord "arrival" message for flight "04be266c-df78-4bec-9f50-281cc02ce7f2" containing "Flight **AAL4913** from **Boston (BOS)** to **Philadelphia (PHL)** just arrived!"
    And I see Discord "arrival" message for flight "04be266c-df78-4bec-9f50-281cc02ce7f2" containing "Actual block time:"
    And I see Discord "arrival" message for flight "04be266c-df78-4bec-9f50-281cc02ce7f2" containing "[Flight Tracker](https://flights.barcz.me/live-tracking/04be266c-df78-4bec-9f50-281cc02ce7f2)"
    And I clear Discord messages directory
    And I set database to initial state

  Scenario: As a cabin crew I cannot report on-block for flight twice
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2/report-on-block"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2/report-on-block"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot report on-block for flight that is not taxiing in.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot report on-block for flight that not reported off-block
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-on-block"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot report on-block for flight that is not taxiing in.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As a cabin crew I cannot report on-block for flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0ee4dec-b1fd-44aa-822c-28a7ead0191a/report-on-block"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot report on-block for flight with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/invalid-uuid/report-on-block"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot report on-block
    When I send a "POST" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2/report-on-block"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
