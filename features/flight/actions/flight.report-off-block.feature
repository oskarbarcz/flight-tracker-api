Feature: Report off-block

  Scenario: As an admin I can report off-block
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/report-off-block"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can report off-block
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/report-off-block"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I can report off-block for flight that finished boarding
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/report-off-block"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "f14a2141-4737-4622-a387-40513ff3baf1",
        "flightNumber": "AA4910",
        "callsign": "AAL4910",
        "status": "taxiing_out",
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
            "arrivalTime": null,
            "onBlockTime": null,
            "takeoffTime": null,
            "offBlockTime": "@date('within 1 minute from now')"
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
          "icaoCode": "B773",
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
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    When I send a "GET" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "4e1cae7d-1cc4-493e-ae59-fcd87e97416a",
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
          "id": "e72a93c0-c3ad-4863-a994-f355f10989dd",
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
          "id": "fb3236f0-0318-40be-b581-3312ece412e7",
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
          "id": "9ac32500-3bad-471a-b6e1-577916abde24",
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
          "id": "1489e92f-dde6-4d16-8a0a-f38b18f6e272",
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
          "id": "66bcc725-7acd-42e9-b3db-1513176a537f",
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
          "id": "@uuid",
          "scope": "user",
          "type": "flight.off-block-reported",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot report off-block for flight twice
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/report-off-block"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/report-off-block"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot report off-block for flight that not finished boarding.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot report off-block for flight is not checked in
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/report-off-block"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot report off-block for flight that not finished boarding.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As a cabin crew I cannot report off-block for flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0ee4dec-b1fd-44aa-822c-28a7ead0191a/report-off-block"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot report off-block for flight with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/invalid-uuid/report-off-block"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot report off-block
    When I send a "POST" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/report-off-block"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
