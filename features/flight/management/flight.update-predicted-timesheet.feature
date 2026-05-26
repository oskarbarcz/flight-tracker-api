Feature: Update flight predicted timesheet

  Scenario: As an admin I cannot update flight predicted timesheet
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      { "takeoffTime": "2022-02-02T15:25:00.000Z" }
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

  Scenario: As operations I cannot update flight predicted timesheet
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      { "takeoffTime": "2022-02-02T15:25:00.000Z" }
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

  Scenario: As cabin crew I can predict a single time and the flight reflects it
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "e91e13a9-09d8-48bf-8453-283cef467b88"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      { "takeoffTime": "2025-01-01T13:10:00.000Z" }
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
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          },
          "predicted": {
            "arrivalTime": null,
            "onBlockTime": null,
            "takeoffTime": "2025-01-01T13:10:00.000Z",
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
            "blockFuel": 12.7
          },
          "final": null
        },
        "aircraft": {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "airframe": {
            "type": "B77W",
            "name": "B777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
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
            "type": "departure",
            "shape": [
              { "latitude": 42.35454, "longitude": -71.02663 },
              { "latitude": 42.35454, "longitude": -71.00663 },
              { "latitude": 42.37454, "longitude": -71.00663 },
              { "latitude": 42.37454, "longitude": -71.02663 }
            ]
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
            "shape": [
              { "latitude": 39.86113, "longitude": -75.25349 },
              { "latitude": 39.86113, "longitude": -75.23349 },
              { "latitude": 39.88113, "longitude": -75.23349 },
              { "latitude": 39.88113, "longitude": -75.25349 }
            ]
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
            "shape": [
              { "latitude": 40.6313, "longitude": -73.7881 },
              { "latitude": 40.6313, "longitude": -73.7681 },
              { "latitude": 40.6513, "longitude": -73.7681 },
              { "latitude": 40.6513, "longitude": -73.7881 }
            ]
          }
        ],
        "departureGateId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalGateId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "source": "manual",
        "tracking": "public",
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
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
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.predicted-timesheet-updated",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.predicted-timesheet-updated" within 2000ms
    And I set database to initial state

  Scenario: As cabin crew omitted fields preserve previously stored predicted values
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "e91e13a9-09d8-48bf-8453-283cef467b88"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      { "arrivalTime": "2025-01-01T15:50:00.000Z" }
      """
    Then the response status should be 204
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      { "takeoffTime": "2025-01-01T13:10:00.000Z" }
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
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          },
          "predicted": {
            "arrivalTime": "2025-01-01T15:50:00.000Z",
            "onBlockTime": null,
            "takeoffTime": "2025-01-01T13:10:00.000Z",
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
            "blockFuel": 12.7
          },
          "final": null
        },
        "aircraft": {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "airframe": {
            "type": "B77W",
            "name": "B777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
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
            "type": "departure",
            "shape": [
              { "latitude": 42.35454, "longitude": -71.02663 },
              { "latitude": 42.35454, "longitude": -71.00663 },
              { "latitude": 42.37454, "longitude": -71.00663 },
              { "latitude": 42.37454, "longitude": -71.02663 }
            ]
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
            "shape": [
              { "latitude": 39.86113, "longitude": -75.25349 },
              { "latitude": 39.86113, "longitude": -75.23349 },
              { "latitude": 39.88113, "longitude": -75.23349 },
              { "latitude": 39.88113, "longitude": -75.25349 }
            ]
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
            "shape": [
              { "latitude": 40.6313, "longitude": -73.7881 },
              { "latitude": 40.6313, "longitude": -73.7681 },
              { "latitude": 40.6513, "longitude": -73.7681 },
              { "latitude": 40.6513, "longitude": -73.7881 }
            ]
          }
        ],
        "departureGateId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalGateId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "source": "manual",
        "tracking": "public",
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
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
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.predicted-timesheet-updated",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.predicted-timesheet-updated",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.predicted-timesheet-updated" within 2000ms
    And I set database to initial state

  Scenario: As cabin crew explicit null clears a previously predicted value
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "e91e13a9-09d8-48bf-8453-283cef467b88"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "takeoffTime": "2025-01-01T13:10:00.000Z"
      }
      """
    Then the response status should be 204
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      { "arrivalTime": null }
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
            "arrivalTime": "2025-01-01T16:00:00.000Z",
            "onBlockTime": "2025-01-01T16:18:00.000Z",
            "takeoffTime": "2025-01-01T13:15:00.000Z",
            "offBlockTime": "2025-01-01T13:00:00.000Z"
          },
          "predicted": {
            "arrivalTime": null,
            "onBlockTime": null,
            "takeoffTime": "2025-01-01T13:10:00.000Z",
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
            "blockFuel": 12.7
          },
          "final": null
        },
        "aircraft": {
          "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
          "airframe": {
            "type": "B77W",
            "name": "B777-300ER",
            "cruiseSpeed": { "value": 0.84, "unit": "mach" },
            "serviceCeiling": 43000,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
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
            "type": "departure",
            "shape": [
              { "latitude": 42.35454, "longitude": -71.02663 },
              { "latitude": 42.35454, "longitude": -71.00663 },
              { "latitude": 42.37454, "longitude": -71.00663 },
              { "latitude": 42.37454, "longitude": -71.02663 }
            ]
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
            "shape": [
              { "latitude": 39.86113, "longitude": -75.25349 },
              { "latitude": 39.86113, "longitude": -75.23349 },
              { "latitude": 39.88113, "longitude": -75.23349 },
              { "latitude": 39.88113, "longitude": -75.25349 }
            ]
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
            "shape": [
              { "latitude": 40.6313, "longitude": -73.7881 },
              { "latitude": 40.6313, "longitude": -73.7681 },
              { "latitude": 40.6513, "longitude": -73.7681 },
              { "latitude": 40.6513, "longitude": -73.7881 }
            ]
          }
        ],
        "departureGateId": null,
        "departureRunwayId": "08a1d5f0-fbfb-4272-9cc4-6821506fe308",
        "arrivalGateId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "source": "manual",
        "tracking": "public",
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
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
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.predicted-timesheet-updated",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.predicted-timesheet-updated",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.predicted-timesheet-updated" within 2000ms
    And I set database to initial state

  Scenario: As cabin crew I cannot predict off-block time once flight is taxiing out
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/timesheet/predicted" with body:
      """json
      { "offBlockTime": "2025-01-01T12:55:00.000Z" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update predicted off-block time after flight has reported off-block.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As cabin crew I cannot predict takeoff time once flight is in cruise
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/timesheet/predicted" with body:
      """json
      { "takeoffTime": "2025-01-01T13:10:00.000Z" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update predicted takeoff time after flight has reported takeoff.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As cabin crew I cannot predict arrival time once flight is taxiing in
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/04be266c-df78-4bec-9f50-281cc02ce7f2/timesheet/predicted" with body:
      """json
      { "arrivalTime": "2025-01-01T15:55:00.000Z" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update predicted arrival time after flight has reported arrival.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As cabin crew I cannot predict on-block time once flight is on-block
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/17d2f703-957d-4ad1-a620-3c187a70c26a/timesheet/predicted" with body:
      """json
      { "onBlockTime": "2025-01-01T16:15:00.000Z" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update predicted on-block time after flight has reported on-block.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As cabin crew I can still predict a downstream time on a taxiing-out flight
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "7105891a-8008-4b47-b473-c81c97615ad7"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/timesheet/predicted" with body:
      """json
      { "arrivalTime": "2025-01-01T15:55:00.000Z" }
      """
    Then the response status should be 204
    And I should receive a live flight event of type "flight.predicted-timesheet-updated" within 2000ms
    And I set database to initial state

  Scenario: As cabin crew a closed flight rejects every predicted update
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/23da8bc9-a21b-4678-b2e9-1151d3bd15ab/timesheet/predicted" with body:
      """json
      { "onBlockTime": "2025-01-01T16:15:00.000Z" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update predicted on-block time after flight has reported on-block.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As cabin crew I cannot predict timesheet of a flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/732454c3-732e-4e1f-a075-d7fc61296449/timesheet/predicted" with body:
      """json
      { "takeoffTime": "2025-01-01T13:10:00.000Z" }
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

  Scenario: As cabin crew I cannot predict timesheet with incorrect uuid in path
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/incorrect-uuid/timesheet/predicted" with body:
      """json
      { "takeoffTime": "2025-01-01T13:10:00.000Z" }
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

  Scenario: As cabin crew I cannot predict timesheet with non-date string
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      { "takeoffTime": "not-a-date" }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "takeoffTime": ["takeoffTime must be a Date instance"]
        }
      }
      """

  Scenario: As cabin crew I cannot predict timesheet with unknown property
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      { "boardingTime": "2025-01-01T13:10:00.000Z" }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "boardingTime": ["property boardingTime should not exist"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot predict timesheet
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/predicted" with body:
      """json
      { "takeoffTime": "2025-01-01T13:10:00.000Z" }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
