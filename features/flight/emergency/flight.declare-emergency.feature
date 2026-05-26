Feature: Declare a flight emergency

  Scenario: As an admin I cannot declare a flight emergency
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/emergency" with body:
      """json
      {
        "urgency": "mayday",
        "threatLevel": "critical",
        "category": "ata-72-engine",
        "squawk": "7700",
        "intention": "divert",
        "lastKnownPosition": { "longitude": 8.570556, "latitude": 50.033333 },
        "fuelEnduranceMinutes": 95,
        "dangerousGoodsOnBoard": ["class-3-flammable-liquids"],
        "freeText": "Engine #2 fire warning, ECAM actions completed, returning to FRA."
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

  Scenario: As an operations I cannot declare a flight emergency
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/emergency" with body:
      """json
      {
        "urgency": "mayday",
        "threatLevel": "critical",
        "category": "ata-72-engine",
        "squawk": "7700",
        "intention": "divert",
        "lastKnownPosition": { "longitude": 8.570556, "latitude": 50.033333 },
        "fuelEnduranceMinutes": 95,
        "dangerousGoodsOnBoard": ["class-3-flammable-liquids"],
        "freeText": "Engine #2 fire warning, ECAM actions completed, returning to FRA."
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

  Scenario: As a cabin crew I can declare a MAYDAY for an in-cruise flight
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/emergency" with body:
      """json
      {
        "urgency": "mayday",
        "threatLevel": "critical",
        "category": "ata-72-engine",
        "squawk": "7700",
        "intention": "divert",
        "lastKnownPosition": { "longitude": 8.570556, "latitude": 50.033333 },
        "fuelEnduranceMinutes": 95,
        "dangerousGoodsOnBoard": ["class-3-flammable-liquids"],
        "freeText": "Engine #2 fire warning, ECAM actions completed, returning to FRA."
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "urgency": "mayday",
        "threatLevel": "critical",
        "category": "ata-72-engine",
        "squawk": "7700",
        "intention": "divert",
        "lastKnownPosition": { "longitude": 8.570556, "latitude": 50.033333 },
        "soulsOnBoard": 374,
        "fuelEnduranceMinutes": 95,
        "dangerousGoodsOnBoard": ["class-3-flammable-liquids"],
        "freeText": "Engine #2 fire warning, ECAM actions completed, returning to FRA.",
        "declarationTime": "@date('within 1 minute from now')",
        "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
        "resolvedAt": null,
        "resolvedBy": null
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
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:00:00.000Z"
        },
        {
          "id": "9822a1b2-9715-40a5-94cb-d8b616637457",
          "scope": "operations",
          "type": "flight.preliminary-loadsheet-updated",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:05:00.000Z"
        },
        {
          "id": "88651e15-57d0-468f-9231-bd2e1edcff66",
          "scope": "operations",
          "type": "flight.released",
          "payload": {},
          "actor": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
          "createdAt": "2025-01-01T11:10:00.000Z"
        },
        {
          "id": "3d802611-728b-41cd-a4d1-f9fc91aaca18",
          "scope": "user",
          "type": "flight.pilot-checked-in",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T12:00:00.000Z"
        },
        {
          "id": "d2794a43-60e2-4abe-9803-ce75dfa2a37b",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T12:40:00.000Z"
        },
        {
          "id": "2dba1cb5-d25c-4ade-9d46-e30eb8ecb24a",
          "scope": "user",
          "type": "flight.boarding-finished",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T13:05:00.000Z"
        },
        {
          "id": "d03bb44f-88d8-42cd-aa29-342eda6ebbf3",
          "scope": "user",
          "type": "flight.off-block-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T13:10:00.000Z"
        },
        {
          "id": "0108b08b-9c45-49ba-a3cb-a3ae172ce92c",
          "scope": "user",
          "type": "flight.takeoff-reported",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "2025-01-01T13:25:00.000Z"
        },
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.emergency-declared",
          "payload": {},
          "actor": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
          "createdAt": "@date('within 1 minute from now')"
        }
      ]
      """
    And I should receive a live flight event of type "flight.emergency-declared" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I can declare a silent emergency, omitting squawk and position
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "7105891a-8008-4b47-b473-c81c97615ad7"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/emergency" with body:
      """json
      {
        "urgency": "silent",
        "threatLevel": "medium",
        "category": "unlawful-interference",
        "intention": "continue",
        "fuelEnduranceMinutes": 180,
        "dangerousGoodsOnBoard": [],
        "freeText": "Suspected unlawful interference in cabin; cockpit secure."
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "urgency": "silent",
        "threatLevel": "medium",
        "category": "unlawful-interference",
        "squawk": null,
        "intention": "continue",
        "lastKnownPosition": null,
        "soulsOnBoard": 374,
        "fuelEnduranceMinutes": 180,
        "dangerousGoodsOnBoard": [],
        "freeText": "Suspected unlawful interference in cabin; cockpit secure.",
        "declarationTime": "@date('within 1 minute from now')",
        "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
        "resolvedAt": null,
        "resolvedBy": null
      }
      """
    And I should receive a live flight event of type "flight.emergency-declared" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I cannot declare a second emergency while one is still active
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b88f1c0d-3a55-4ce0-9f7b-1c2d3e4f5a6b/emergency" with body:
      """json
      {
        "urgency": "mayday",
        "threatLevel": "high",
        "category": "ata-24-electrical-power",
        "squawk": "7700",
        "intention": "immediate-landing",
        "fuelEnduranceMinutes": 30,
        "dangerousGoodsOnBoard": [],
        "freeText": "Total generator failure."
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "This flight already has an active emergency. Resolve it before declaring another."
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot declare an emergency on a flight that has not left the gate
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/emergency" with body:
      """json
      {
        "urgency": "panpan",
        "threatLevel": "low",
        "category": "other",
        "intention": "continue",
        "fuelEnduranceMinutes": 200,
        "dangerousGoodsOnBoard": [],
        "freeText": "Test"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Entity",
        "message": "Emergency can only be declared between off-block and on-block reports."
      }
      """

  Scenario: As a cabin crew I cannot declare an emergency on a flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/11111111-1111-4111-8111-111111111111/emergency" with body:
      """json
      {
        "urgency": "panpan",
        "threatLevel": "low",
        "category": "other",
        "intention": "continue",
        "fuelEnduranceMinutes": 200,
        "dangerousGoodsOnBoard": [],
        "freeText": "Test"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight with given id does not exist."
      }
      """

  Scenario: As an unauthorized user I cannot declare an emergency
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/emergency" with body:
      """json
      {
        "urgency": "mayday",
        "threatLevel": "critical",
        "category": "ata-72-engine",
        "intention": "divert",
        "fuelEnduranceMinutes": 95,
        "dangerousGoodsOnBoard": [],
        "freeText": "test"
      }
      """
    Then the response status should be 401
