Feature: Get the delay allocation request for a flight

  Scenario: As a cabin crew I can read the delay allocation request with its reports
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "06505a5b-2475-470e-8825-c4a079e4be4b",
        "flightId": "7105891a-8008-4b47-b473-c81c97615ad7",
        "totalDelayMinutes": 10,
        "allocatedMinutes": 10,
        "isReconciled": true,
        "isSettled": false,
        "reports": [
          {
            "id": "aa81d28e-c67f-4ba3-9637-77301ea408a1",
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
            "id": "368789fd-0a5c-4e96-9ed2-9c5b2de368d1",
            "delayMinutes": 4,
            "reasonCode": "ATZ",
            "freeText": null,
            "rejectionReason": null,
            "status": "pending",
            "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
            "decidedBy": null,
            "decidedAt": null,
            "createdAt": "2025-01-01T13:17:00.000Z"
          }
        ],
        "createdAt": "2025-01-01T13:15:00.000Z"
      }
      """

  Scenario: As an operations I can read a fully settled delay allocation request
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/delay"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "9d54d8d3-ae4f-4fa4-b4c3-91d12891c81f",
        "flightId": "38644393-deee-434d-bfd1-7242abdbc4e1",
        "totalDelayMinutes": 10,
        "allocatedMinutes": 10,
        "isReconciled": true,
        "isSettled": true,
        "reports": [
          {
            "id": "4ccb028e-51f5-4d80-9c83-1ab1b3b13c30",
            "delayMinutes": 6,
            "reasonCode": "RLL",
            "freeText": null,
            "rejectionReason": null,
            "status": "accepted",
            "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
            "decidedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
            "decidedAt": "2025-01-01T13:20:00.000Z",
            "createdAt": "2025-01-01T13:16:00.000Z"
          },
          {
            "id": "800243c5-0c77-4ace-b4cb-5b2ff499a1c1",
            "delayMinutes": 4,
            "reasonCode": "ATZ",
            "freeText": null,
            "rejectionReason": null,
            "status": "accepted",
            "reportedBy": { "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d", "name": "Rick Doe" },
            "decidedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
            "decidedAt": "2025-01-01T13:21:00.000Z",
            "createdAt": "2025-01-01T13:17:00.000Z"
          }
        ],
        "createdAt": "2025-01-01T13:15:00.000Z"
      }
      """

  Scenario: As a cabin crew I get a 404 for a flight without a delay allocation request
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/delay"
    Then the response status should be 404

  Scenario: As an admin I cannot read a delay request
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot read a delay request
    When I send a "GET" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
