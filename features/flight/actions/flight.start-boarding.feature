Feature: Start boarding

  Scenario: As an admin I cannot start boarding
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot start boarding
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I can start boarding in flight that is checked in
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "b3899775-278e-4496-add1-21385a13d93e",
        "flightNumber": "AA4908",
        "callsign": "AAL4908",
        "status": "boarding_started",
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
          "final": null
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
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    When I send a "GET" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "6df6997c-98ad-43b1-8d36-72b921bec1c3",
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
          "id": "4f9d78e7-b0c9-48a3-a5c8-27d6edd530a1",
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
          "id": "47c8db09-e786-4287-840c-b54278d543b5",
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
          "id": "82746826-3d70-40b0-93ac-d61d6af0ef43",
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
          "id": "@uuid",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": {},
          "actor": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I see Discord "departure" message for flight "b3899775-278e-4496-add1-21385a13d93e" containing ":airplane_departure: :airplane_departure: :airplane_departure:"
    And I see Discord "departure" message for flight "b3899775-278e-4496-add1-21385a13d93e" containing "Flight **AAL4908** from **Boston (BOS)** to **Philadelphia (PHL)** has started boarding!"
    And I see Discord "departure" message for flight "b3899775-278e-4496-add1-21385a13d93e" containing "Estimated block time: **03:08hrs**, Passengers on board: **370**"
    And I see Discord "departure" message for flight "b3899775-278e-4496-add1-21385a13d93e" containing "[Flight Tracker](https://flights.barcz.me/live-tracking/b3899775-278e-4496-add1-21385a13d93e)"
    And I set database to initial state
    And I clear Discord messages directory

  Scenario: As a cabin crew I cannot start boarding in flight twice
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot start boarding for flight, because flight is checked in.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot start boarding when flight is not checked in
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/start-boarding"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot start boarding for flight, because flight is checked in.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As a cabin crew I cannot start boarding in flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0ee4dec-b1fd-44aa-822c-28a7ead0191a/start-boarding"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot start boarding in flight with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/invalid-uuid/start-boarding"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot start boarding
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
