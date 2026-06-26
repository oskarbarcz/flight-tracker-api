Feature: Update flight departure gate

  Scenario: As an admin I cannot update departure gate
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/departure-gate" with body:
      """json
      { "departureGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
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

  Scenario: As operations I can set departure gate
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/departure-gate" with body:
      """json
      { "departureGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response body should contain:
      """json
      {
        "id": "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05",
        "flightNumber": "LH450",
        "callsign": "DLH450",
        "atcCallsign": null,
        "isEtops": true,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2025-01-01T21:00:00.000Z",
            "onBlockTime": "2025-01-01T21:10:00.000Z",
            "takeoffTime": "2025-01-01T12:15:00.000Z",
            "offBlockTime": "2025-01-01T12:00:00.000Z"
          }
        },
        "loadsheets": { "preliminary": null, "final": null },
        "aircraft": {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
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
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "city": "Frankfurt",
            "name": "Frankfurt Rhein/Main",
            "country": "Germany",
            "timezone": "Europe/Berlin",
            "type": "departure",
            "continent": "europe",
            "location": { "longitude": 8.57397, "latitude": 50.04693 },
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
            "type": "destination",
            "continent": "north_america",
            "location": { "longitude": -73.7781, "latitude": 40.6413 },
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
            "type": "destination_alternate",
            "continent": "north_america",
            "location": { "longitude": -75.24349, "latitude": 39.87113 },
            "shape": "@coordinates"
          },
          {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "icaoCode": "KBOS",
            "iataCode": "BOS",
            "city": "Boston",
            "name": "Boston Logan Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "type": "destination_alternate",
            "continent": "north_america",
            "location": { "longitude": -71.01663, "latitude": 42.36454 },
            "shape": "@coordinates"
          },
          {
            "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
            "icaoCode": "CYYT",
            "iataCode": "YYT",
            "city": "St. Johns",
            "name": "St. Johns Intl",
            "country": "Canada",
            "timezone": "America/St_Johns",
            "continent": "north_america",
            "type": "etops_alternate",
            "location": { "longitude": -52.751945, "latitude": 47.61861 },
            "shape": "@coordinates"
          }
        ],
        "departureGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "departureRunwayId": "32121288-2550-4b81-a558-9a7193ef6c97",
        "arrivalGateId": null,
        "arrivalRunwayId": null,
        "isFlightDiverted": false,
        "isEmergencyDeclared": false,
        "hasFlightPath": false,
        "source": "manual",
        "tracking": "private",
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "7b0d3d5a-879c-491c-b6e0-ec051ac9fbc4",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "e70f19df-81b4-4712-b4a5-16be22c85ebe",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "9db99c92-dd95-4089-b11b-abe3ac1d262b",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "operations",
          "type": "flight.departure-gate-changed",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.departure-gate-changed" within 2000ms
    And I set database to initial state

  Scenario: As cabin crew I can set departure gate
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/departure-gate" with body:
      """json
      { "departureGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "7b0d3d5a-879c-491c-b6e0-ec051ac9fbc4",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "e70f19df-81b4-4712-b4a5-16be22c85ebe",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "9db99c92-dd95-4089-b11b-abe3ac1d262b",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.departure-gate-changed",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.departure-gate-changed" within 2000ms
    And I set database to initial state

  Scenario: As operations I cannot clear departure gate with null
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/departure-gate" with body:
      """json
      { "departureGateId": null }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "departureGateId": ["departureGateId must be a UUID"]
        }
      }
      """

  Scenario: As operations I cannot update gate after pilot checked in
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/48760636-9520-4863-b32f-f3618556feb7/departure-gate" with body:
      """json
      { "departureGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update departure gate, because pilot is already checked in.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As cabin crew I cannot update gate after pilot checked in
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/48760636-9520-4863-b32f-f3618556feb7/departure-gate" with body:
      """json
      { "departureGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Cannot update departure gate, because pilot is already checked in.",
        "error": "Unprocessable Entity",
        "statusCode": 422
      }
      """

  Scenario: As operations I cannot assign gate that does not belong to departure airport
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/departure-gate" with body:
      """json
      { "departureGateId": "58c83720-fb20-4c84-b727-ba6dda14f8d1" }
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

  Scenario: As operations I cannot update gate of non-existing flight
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/58c83720-fb20-4c84-b727-ba6dda14f8d1/departure-gate" with body:
      """json
      { "departureGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
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

  Scenario: As operations I cannot update gate with invalid uuid in body
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/departure-gate" with body:
      """json
      { "departureGateId": "not-a-uuid" }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "departureGateId": ["departureGateId must be a UUID"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot update gate
    When I send a "PATCH" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/departure-gate" with body:
      """json
      { "departureGateId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101" }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
