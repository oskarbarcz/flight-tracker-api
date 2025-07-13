Feature: Update flight preliminary loadsheet

  Scenario: As an admin I cannot update flight preliminary loadsheet
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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

  Scenario: As operations I can update flight preliminary loadsheet
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "e91e13a9-09d8-48bf-8453-283cef467b88",
        "flightNumber": "AA 4907",
        "callsign": "AAL 4907",
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
            "flightCrew": {
              "pilots": 2,
              "reliefPilots": 0,
              "cabinCrew": 5
            },
            "passengers": 360,
            "payload": 38.5,
            "cargo": 7.5,
            "zeroFuelWeight": 197.9,
            "blockFuel": 12.7
          },
          "final": null
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
            "type": "destination"
          },
          {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "icaoCode": "KJFK",
            "iataCode": "JFK",
            "city": "New York",
            "name": "New York JFK",
            "country": "United States of America",
            "timezone": "America/New_York",
            "type": "destination_alternate"
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "a1d43d93-0958-45bc-aa5e-3b1c4a081d74",
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
          "id": "@uuid",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot update flight preliminary loadsheet
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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

  Scenario: As operations I cannot update preliminary loadsheet of flight with status other than created
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot update preliminary loadsheet, because flight was marked as ready."
      }
      """

  Scenario: As operations I cannot update flight preliminary loadsheet with incorrect payload
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "zeroFuelWeight": 197.9,
        "fuelBurn": 38.5
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
          "payload": [
            "payload must be a number conforming to the specified constraints",
            "payload should not be empty"
          ],
          "cargo": ["cargo must be a number conforming to the specified constraints", "cargo should not be empty"],
          "blockFuel": [
            "blockFuel must be a number conforming to the specified constraints",
            "blockFuel should not be empty"
          ],
          "fuelBurn": ["property fuelBurn should not exist"]
        }
      }
      """

  Scenario: As operations I cannot update preliminary loadsheet of flight that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/732454c3-732e-4e1f-a075-d7fc61296449/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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

  Scenario: As operations I cannot update scheduled timesheet of flight with incorrect uuid
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/incorrect-uuid/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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

  Scenario: As an unauthorized user I cannot report arrival
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 360,
        "payload": 38.5,
        "cargo": 7.5,
        "zeroFuelWeight": 197.9,
        "blockFuel": 12.7
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
