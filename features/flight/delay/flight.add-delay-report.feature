Feature: File and remove delay allocation reports

  Scenario: As a cabin crew I can file a coded delay report
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "7105891a-8008-4b47-b473-c81c97615ad7"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay" with body:
      """json
      {
        "delayMinutes": 5,
        "reasonCode": "OFL",
        "freeText": "Fuelling truck arrived late to stand."
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "de1a0000-0000-4000-8000-000000000001",
        "flightId": "7105891a-8008-4b47-b473-c81c97615ad7",
        "totalDelayMinutes": 10,
        "allocatedMinutes": 15,
        "isReconciled": false,
        "isSettled": false,
        "reports": [
          {
            "id": "de1a0000-0000-4000-8000-000000000011",
            "delayMinutes": 6,
            "reasonCode": "RLL",
            "freeText": null,
            "rejectionReason": null,
            "status": "pending",
            "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
            "decidedBy": null,
            "decidedAt": null,
            "createdAt": "2025-01-01T13:16:00.000Z"
          },
          {
            "id": "de1a0000-0000-4000-8000-000000000012",
            "delayMinutes": 4,
            "reasonCode": "ATZ",
            "freeText": null,
            "rejectionReason": null,
            "status": "pending",
            "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
            "decidedBy": null,
            "decidedAt": null,
            "createdAt": "2025-01-01T13:17:00.000Z"
          },
          {
            "id": "@uuid",
            "delayMinutes": 5,
            "reasonCode": "OFL",
            "freeText": "Fuelling truck arrived late to stand.",
            "rejectionReason": null,
            "status": "pending",
            "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
            "decidedBy": null,
            "decidedAt": null,
            "createdAt": "@date('within 1 minute from now')"
          }
        ],
        "createdAt": "2025-01-01T13:15:00.000Z"
      }
      """
    And I should receive a live flight event of type "flight.delay-report-filed" within 2000ms
    And I set database to initial state

  Scenario: As a cabin crew I cannot file a report with zero minutes
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay" with body:
      """json
      {
        "delayMinutes": 0,
        "reasonCode": "OFL"
      }
      """
    Then the response status should be 400

  Scenario: As a cabin crew I cannot file a report with an unknown reason code
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay" with body:
      """json
      {
        "delayMinutes": 5,
        "reasonCode": "XYZ"
      }
      """
    Then the response status should be 400

  Scenario: As a cabin crew I cannot file a report for a flight without a request
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/delay" with body:
      """json
      {
        "delayMinutes": 5,
        "reasonCode": "OFL"
      }
      """
    Then the response status should be 404

  Scenario: As an operations I cannot file a delay report
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay" with body:
      """json
      {
        "delayMinutes": 5,
        "reasonCode": "OFL"
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

  Scenario: As an admin I cannot file a delay report
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay" with body:
      """json
      {
        "delayMinutes": 5,
        "reasonCode": "OFL"
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

  Scenario: As an unauthorized user I cannot file a delay report
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay" with body:
      """json
      {
        "delayMinutes": 5,
        "reasonCode": "OFL"
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

  Scenario: As a cabin crew I can remove a pending report
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/de1a0000-0000-4000-8000-000000000011"
    Then the response status should be 204
    And I set database to initial state

  Scenario: As a cabin crew I cannot remove an accepted report
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/delay/de1a0000-0000-4000-8000-000000000021"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "This delay allocation report has already been accepted and is frozen."
      }
      """

  Scenario: As a cabin crew I cannot remove a report that does not exist
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/11111111-1111-4111-8111-111111111111"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Delay allocation report with given id does not exist for this flight."
      }
      """

  Scenario: As an operations I cannot remove a delay report
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/de1a0000-0000-4000-8000-000000000011"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an admin I cannot remove a delay report
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/de1a0000-0000-4000-8000-000000000011"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot remove a delay report
    When I send a "DELETE" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/de1a0000-0000-4000-8000-000000000011"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
