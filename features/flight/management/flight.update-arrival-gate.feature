Feature: Update flight arrival gate

  Scenario: As an admin I cannot update arrival gate
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/arrival-gate" with body:
      """json
      { "arrivalGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
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

  Scenario: As operations I can set arrival gate
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/arrival-gate" with body:
      """json
      { "arrivalGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response body should contain:
      """json
      {
        "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66",
        "flightNumber": "LH41",
        "callsign": "DLH41",
        "atcCallsign": null,
        "isEtops": true,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2025-01-02T11:30:00.000Z",
            "onBlockTime": "2025-01-02T11:45:00.000Z",
            "takeoffTime": "2025-01-02T04:20:00.000Z",
            "offBlockTime": "2025-01-02T04:00:00.000Z"
          }
        },
        "loadsheets": {
          "preliminary": {
            "flightCrew": { "pilots": 2, "reliefPilots": 1, "cabinCrew": 12 },
            "passengers": 335,
            "payload": 34.9,
            "cargo": 8.4,
            "zeroFuelWeight": 162.3,
            "blockFuel": 47.9
          },
          "final": null
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
            "type": "departure",
            "continent": "north_america",
            "location": { "longitude": -73.7781, "latitude": 40.6413 }
          },
          {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "city": "Frankfurt",
            "name": "Frankfurt Rhein/Main",
            "country": "Germany",
            "timezone": "Europe/Berlin",
            "type": "destination",
            "continent": "europe",
            "location": { "longitude": 8.57397, "latitude": 50.04693 }
          },
          {
            "id": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
            "icaoCode": "EDDW",
            "iataCode": "BRE",
            "city": "Bremen",
            "name": "Bremen",
            "country": "Germany",
            "timezone": "Europe/Berlin",
            "type": "destination_alternate",
            "continent": "europe",
            "location": { "longitude": 8.786667, "latitude": 53.0475 }
          },
          {
            "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
            "icaoCode": "BIKF",
            "iataCode": "KEF",
            "city": "Reykjavik",
            "name": "Reykjavik Keflavik",
            "country": "Iceland",
            "timezone": "Atlantic/Reykjavik",
            "type": "etops_alternate",
            "continent": "europe",
            "location": { "longitude": -21.9406, "latitude": 64.13 }
          },
          {
            "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
            "icaoCode": "CYYT",
            "iataCode": "YYT",
            "city": "St. Johns",
            "name": "St. Johns Intl",
            "country": "Canada",
            "timezone": "America/St_Johns",
            "type": "etops_alternate",
            "continent": "north_america",
            "location": { "longitude": -52.751945, "latitude": 47.61861 }
          }
        ],
        "departureGateId": null,
        "departureRunwayId": "6bbf43a4-9242-4f04-b195-6a7bcd1f14c4",
        "arrivalGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "arrivalRunwayId": "32121288-2550-4b81-a558-9a7193ef6c97",
        "isFlightDiverted": false,
        "source": "manual",
        "tracking": "private",
        "rotationId": "bd8f2d64-a647-42da-be63-c6589915e6c9",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    When I send a "GET" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "scope": "operations",
          "type": "flight.arrival-gate-changed",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I set database to initial state

  Scenario: As cabin crew I can set arrival gate
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/arrival-gate" with body:
      """json
      { "arrivalGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.arrival-gate-changed",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I set database to initial state

  Scenario: As operations I cannot clear arrival gate with null
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/arrival-gate" with body:
      """json
      { "arrivalGateId": null }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "arrivalGateId": ["arrivalGateId must be a UUID"]
        }
      }
      """

  Scenario: As operations I cannot update arrival gate after on-block was reported
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/d4a25ef2-39cf-484c-af00-a548999e8699/arrival-gate" with body:
      """json
      { "arrivalGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update arrival gate after on-block was reported.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As cabin crew I cannot update arrival gate after on-block was reported
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/d4a25ef2-39cf-484c-af00-a548999e8699/arrival-gate" with body:
      """json
      { "arrivalGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update arrival gate after on-block was reported.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As operations I cannot assign gate that does not belong to arrival airport
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/arrival-gate" with body:
      """json
      { "arrivalGateId": "ffffffff-ffff-4fff-8fff-ffffffffffff" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Gate does not belong to the given airport.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As operations I cannot update arrival gate of non-existing flight
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/ffffffff-ffff-4fff-8fff-ffffffffffff/arrival-gate" with body:
      """json
      { "arrivalGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
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

  Scenario: As operations I cannot update arrival gate with invalid uuid in body
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/arrival-gate" with body:
      """json
      { "arrivalGateId": "not-a-uuid" }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "arrivalGateId": ["arrivalGateId must be a UUID"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot update arrival gate
    When I send a "PATCH" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/arrival-gate" with body:
      """json
      { "arrivalGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
