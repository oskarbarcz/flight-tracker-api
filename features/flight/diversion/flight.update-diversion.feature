Feature: Update a flight diversion

  Scenario: As an admin I cannot update flight diversion
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion" with body:
      """json
      {
        "severity": "warning"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "message": "Forbidden resource",
        "error": "Forbidden"
      }
      """

  Scenario: As an operations I can update flight diversion
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "1e9f4176-188f-41a5-a9d1-25a96579f46d"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion" with body:
      """json
      {
        "severity": "warning",
        "reason": "wx",
        "freeText": "Severe thunderstorms closing JFK, diverting to Frankfurt",
        "position": {
          "longitude": 7.123456,
          "latitude": 51.456789
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "7c1482ce-dc03-4401-8472-0c25eef35de9",
        "severity": "warning",
        "reason": "wx",
        "freeText": "Severe thunderstorms closing JFK, diverting to Frankfurt",
        "position": {
          "longitude": 7.123456,
          "latitude": 51.456789
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "decisionTime": "2025-01-01T14:25:00.000Z",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00.000Z",
        "airport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "icaoCode": "EDDF",
          "iataCode": "FRA",
          "city": "Frankfurt",
          "name": "Frankfurt Rhein/Main",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "location": {
            "longitude": 8.57397,
            "latitude": 50.04693
          }
        }
      }
      """
    When I send a "GET" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "fe70e3cb-6811-41eb-96e9-1776c37a9393",
          "scope": "operations",
          "type": "flight.created",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "107a860c-31a5-4cdb-ad1d-851ed14617a2",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "e0014752-86ce-449c-8c98-27b7c8bf9fc3",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "5d9a0c3e-f4fe-4fa8-94fe-7575aa15da39",
          "scope": "user",
          "type": "flight.pilot-checked-in",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T12:00:00.000Z"
        },
        {
          "id": "d1b7d1b2-6e4c-43a0-9dd0-986489d5a13a",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T12:40:00.000Z"
        },
        {
          "id": "5927dc9d-64d6-4fd3-8f7e-5820945bbcb3",
          "scope": "user",
          "type": "flight.boarding-finished",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T13:05:00.000Z"
        },
        {
          "id": "2524ad4e-2335-4d22-bed4-42b795f37d02",
          "scope": "user",
          "type": "flight.off-block-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T13:10:00.000Z"
        },
        {
          "id": "b8e8a0cb-16cc-4c37-adb8-46ab55e179d0",
          "scope": "user",
          "type": "flight.takeoff-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T13:25:00.000Z"
        },
        {
          "id": "c11c0944-e7c3-44de-8713-96210871d421",
          "scope": "user",
          "type": "flight.diversion-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T14:25:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "operations",
          "type": "flight.diversion-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.diversion-updated" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I can update flight diversion
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "1e9f4176-188f-41a5-a9d1-25a96579f46d"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion" with body:
      """json
      {
        "severity": "warning",
        "reason": "wx",
        "freeText": "Severe thunderstorms closing JFK, diverting to Frankfurt",
        "position": {
          "longitude": 7.123456,
          "latitude": 51.456789
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "7c1482ce-dc03-4401-8472-0c25eef35de9",
        "severity": "warning",
        "reason": "wx",
        "freeText": "Severe thunderstorms closing JFK, diverting to Frankfurt",
        "position": {
          "longitude": 7.123456,
          "latitude": 51.456789
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "decisionTime": "2025-01-01T14:25:00.000Z",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00.000Z",
        "airport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "icaoCode": "EDDF",
          "iataCode": "FRA",
          "city": "Frankfurt",
          "name": "Frankfurt Rhein/Main",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "location": {
            "longitude": 8.57397,
            "latitude": 50.04693
          }
        }
      }
      """
    And I should receive a live flight event of type "flight.diversion-updated" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I can partially update flight diversion
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "1e9f4176-188f-41a5-a9d1-25a96579f46d"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion" with body:
      """json
      {
        "severity": "caution"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "7c1482ce-dc03-4401-8472-0c25eef35de9",
        "severity": "caution",
        "reason": "med",
        "freeText": null,
        "position": {
          "latitude": 52.520008,
          "longitude": 13.404954
        },
        "notifySecurityOnGround": false,
        "notifyMedicalOnGround": true,
        "notifyFirefightersOnGround": false,
        "decisionTime": "2025-01-01T14:25:00.000Z",
        "estimatedTimeAtDestination": "2025-01-01T15:25:00.000Z",
        "airport": {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "icaoCode": "KJFK",
          "iataCode": "JFK",
          "city": "New York",
          "name": "New York JFK",
          "country": "United States of America",
          "timezone": "America/New_York",
          "continent": "north_america",
          "location": {
            "latitude": 40.6413,
            "longitude": -73.7781
          }
        }
      }
      """
    And I should receive a live flight event of type "flight.diversion-updated" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I cannot update flight diversion when flight has incorrect status
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/d5e8f1a2-3b4c-4d5e-9f6a-7b8c9d0e1f2a/diversion" with body:
      """json
      {
        "severity": "advisory"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Diversion can be reported to flights in Taxiing Out or In Cruise status only",
        "error": "Bad Request"
      }
      """

  Scenario: As a cabin crew I cannot update diversion when none was reported
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion" with body:
      """json
      {
        "severity": "advisory"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "message": "Diversion was not reported for this flight.",
        "error": "Not Found"
      }
      """

  Scenario: As a cabin crew I cannot update diversion for non-existing flight
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/2eb60569-eb00-424e-ab29-6ba10224495c/diversion" with body:
      """json
      {
        "severity": "advisory"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "message": "Flight with given id does not exist.",
        "error": "Not Found"
      }
      """

  Scenario: As an unauthorized user I cannot update flight diversion
    When I send a "PATCH" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion" with body:
      """json
      {
        "severity": "advisory"
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
