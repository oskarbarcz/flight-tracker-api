Feature: Change flight visibility

  Scenario: As an admin I cannot change flight visibility
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/tracking" with body:
      """json
      {
        "tracking": "disabled"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can change flight visibility
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/tracking" with body:
      """json
      {
        "tracking": "disabled"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "e91e13a9-09d8-48bf-8453-283cef467b88",
        "flightNumber": "AA4907",
        "callsign": "AAL4907",
        "atcCallsign": "AAL07J",
        "status": "created",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          }
        },
        "loadsheets": {
          "preliminary": {
              "blockFuel": 12.7,
              "cargo": 8.5,
              "flightCrew": {
                  "cabinCrew": 6,
                  "pilots": 2,
                  "reliefPilots": 0
              },
              "passengers": 370,
              "payload": 40.3,
              "zeroFuelWeight": 208.9
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
        "tracking": "disabled",
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot change flight visibility
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/tracking" with body:
      """json
      {
        "tracking": "disabled"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot change flight visibility with incorrect value
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/tracking" with body:
      """json
      {
        "tracking": "incorrect-value"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "tracking": [
            "tracking must be one of the following values: public, private, disabled"
          ]
        }
      }
      """

  Scenario: As operations I cannot change visibility of flight that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/732454c3-732e-4e1f-a075-d7fc61296449/tracking" with body:
      """json
      {
        "tracking": "disabled"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot change visibility of flight with incorrect uuid
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/incorrect-uuid/tracking" with body:
      """json
      {
        "tracking": "disabled"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot change flight visibility
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/tracking" with body:
      """json
      {
        "tracking": "disabled"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
