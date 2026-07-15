Feature: Report arrival

  Scenario: As an admin I cannot report arrival
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot report arrival
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I can report arrival for flight that reported takeoff
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d",
        "flightNumber": "AA4912",
        "callsign": "AAL4912",
        "atcCallsign": "AAL12J",
        "isEtops": false,
        "status": "taxiing_in",
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
            "arrivalTime": "@date('within 1 minute from now')",
            "onBlockTime": null,
            "takeoffTime": "2025-01-01T13:25:00.000Z",
            "offBlockTime": "2025-01-01T13:10:00.000Z"
          },
          "predicted": {
            "arrivalTime": "2025-01-01T15:55:00.000Z",
            "onBlockTime": "2025-01-01T16:12:00.000Z",
            "takeoffTime": null,
            "offBlockTime": null
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
              "trip": 9.6,
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
          "id": "8694eb6d-83e4-4f24-8a72-b67523b4d6bf",
          "airframe": {
            "type": "B77W",
            "name": "B777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "N724AN",
          "selcal": "AB-DG",
          "livery": "Heritage TWA (2019)",
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
        "actualFuelBurned": null,
        "source": "manual",
        "tracking": "public",
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe",
          "pilotLicenseId": "UK-31270",
          "totalFlightTime": 1797
        }
      }
      """
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "7032f11d-51b2-43ba-9cf1-ae1f144f0707",
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
          "id": "9822a1b2-9715-40a5-94cb-d8b616637457",
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
          "id": "88651e15-57d0-468f-9231-bd2e1edcff66",
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
          "id": "3d802611-728b-41cd-a4d1-f9fc91aaca18",
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
          "id": "d2794a43-60e2-4abe-9803-ce75dfa2a37b",
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
          "id": "2dba1cb5-d25c-4ade-9d46-e30eb8ecb24a",
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
          "id": "d03bb44f-88d8-42cd-aa29-342eda6ebbf3",
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
          "id": "ef447dda-84c1-45e9-9ebe-fa7efe646308",
          "scope": "user",
          "type": "flight.live-position-received",
          "payload": {},
          "actor": null,
          "createdAt": "2025-01-01T13:11:00.000Z"
        },
        {
          "id": "0108b08b-9c45-49ba-a3cb-a3ae172ce92c",
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
          "id": "@uuid",
          "scope": "user",
          "type": "flight.arrival-reported",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.arrival-reported" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I cannot report arrival for flight twice
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot report arrival for flight that is not in cruise.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As a cabin crew I cannot report arrival for flight that not reported takeoff
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/report-arrival"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot report arrival for flight that is not in cruise.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As a cabin crew I cannot report arrival for flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0ee4dec-b1fd-44aa-822c-28a7ead0191a/report-arrival"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot report arrival for flight with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/invalid-uuid/report-arrival"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot report arrival
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
