Feature: Update flight scheduled timesheet

  Scenario: As an admin I cannot update flight scheduled timesheet
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/scheduled" with body:
      """json
      {
        "arrivalTime": "2022-02-02T12:00:00.000Z",
        "onBlockTime": "2022-02-02T12:22:00.000Z",
        "takeoffTime": "2022-02-02T15:25:00.000Z",
        "offBlockTime": "2022-02-02T15:35:00.000Z"
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

  Scenario: As operations I can update flight scheduled timesheet
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "e91e13a9-09d8-48bf-8453-283cef467b88"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/scheduled" with body:
      """json
      {
        "arrivalTime": "2022-02-02T12:00:00.000Z",
        "onBlockTime": "2022-02-02T12:22:00.000Z",
        "takeoffTime": "2022-02-02T15:25:00.000Z",
        "offBlockTime": "2022-02-02T15:35:00.000Z"
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
        "isEtops": false,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2022-02-02T12:00:00.000Z",
            "onBlockTime": "2022-02-02T12:22:00.000Z",
            "takeoffTime": "2022-02-02T15:25:00.000Z",
            "offBlockTime": "2022-02-02T15:35:00.000Z"
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
            "passengers": 368,
            "payload": 39.1,
            "cargo": 8.2,
            "zeroFuelWeight": 207.7,
            "blockFuel": 12.5
          }
        },
        "aircraft": {
          "id": "ed247c36-58f0-43ff-81fd-ffae548a73e2",
          "airframe": {
            "type": "B77W",
            "name": "Boeing 777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "registration": "N719AN",
          "selcal": "AB-CE",
          "livery": "Flagship (2022)",
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
        "hasFlightPath": false,
        "isOffBlockDelayed": false,
        "actualFuelBurned": null,
        "source": "manual",
        "tracking": "public",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "pilot": null
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
          "type": "flight.scheduled-timesheet-updated",
          "payload": {},
          "actor": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.scheduled-timesheet-updated" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I cannot update flight scheduled timesheet
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/scheduled" with body:
      """json
      {
        "arrivalTime": "2022-02-02T12:00:00.000Z",
        "onBlockTime": "2022-02-02T12:22:00.000Z",
        "takeoffTime": "2022-02-02T15:25:00.000Z",
        "offBlockTime": "2022-02-02T15:35:00.000Z"
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

  Scenario: As operations I cannot update scheduled timesheet of flight with status other than created
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/timesheet/scheduled" with body:
      """json
      {
        "arrivalTime": "2022-02-02T12:00:00.000Z",
        "onBlockTime": "2022-02-02T12:22:00.000Z",
        "takeoffTime": "2022-02-02T15:25:00.000Z",
        "offBlockTime": "2022-02-02T15:35:00.000Z"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot change flight schedule, because flight was marked as ready."
      }
      """

  Scenario: As operations I cannot update flight scheduled timesheet with incorrect payload
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/timesheet/scheduled" with body:
      """json
      {
        "arrivalTime": "2022-02-02T12:00:00.000Z",
        "offBlockTime": "some-non-existing-date",
        "testTime": "2022-02-02T15:35:00.000Z"
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
          "onBlockTime": ["onBlockTime must be a Date instance", "onBlockTime should not be empty"],
          "takeoffTime": ["takeoffTime must be a Date instance", "takeoffTime should not be empty"],
          "offBlockTime": ["offBlockTime must be a Date instance"],
          "testTime": ["property testTime should not exist"]
        }
      }
      """

  Scenario: As operations I cannot update scheduled timesheet of flight that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/732454c3-732e-4e1f-a075-d7fc61296449/timesheet/scheduled" with body:
      """json
      {
        "arrivalTime": "2022-02-02T12:00:00.000Z",
        "onBlockTime": "2022-02-02T12:22:00.000Z",
        "takeoffTime": "2022-02-02T15:25:00.000Z",
        "offBlockTime": "2022-02-02T15:35:00.000Z"
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
    When I send a "PATCH" request to "/api/v1/flight/incorrect-uuid/timesheet/scheduled" with body:
      """json
      {
        "arrivalTime": "2022-02-02T12:00:00.000Z",
        "onBlockTime": "2022-02-02T12:22:00.000Z",
        "takeoffTime": "2022-02-02T15:25:00.000Z",
        "offBlockTime": "2022-02-02T15:35:00.000Z"
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
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/scheduled" with body:
      """json
      {
        "arrivalTime": "2022-02-02T12:00:00.000Z",
        "onBlockTime": "2022-02-02T12:22:00.000Z",
        "takeoffTime": "2022-02-02T15:25:00.000Z",
        "offBlockTime": "2022-02-02T15:35:00.000Z"
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
