Feature: Cancel rotation

  Scenario: As operations I can cancel a ready rotation with a reason
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/cancel" with body:
      """json
      {
        "reason": "Crew out of duty hours"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "97f99ca3-6e34-4d99-8631-de754bad0b37",
        "name": "FRA-JFK-FRA 2025-01-02",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
        "status": "canceled",
        "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "updatedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "canceledBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "cancellationReason": "Crew out of duty hours",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "@date('within 1 minute from now')",
        "canceledAt": "@date('within 1 minute from now')",
        "legs": [
          {
            "id": "d31970a7-9dda-4aee-8174-81da36756fd1",
            "flightNumber": "LH888",
            "departure": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
            "arrival": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
            "offBlockTime": "2025-01-01T12:00:00.000Z",
            "onBlockTime": "2025-01-01T20:00:00.000Z",
            "blockTime": 480,
            "flight": null
          },
          {
            "id": "b85748ad-710e-49a7-9102-a9b93cd4a989",
            "flightNumber": "LH41",
            "departure": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
            "arrival": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
            "offBlockTime": "2025-01-01T22:00:00.000Z",
            "onBlockTime": "2025-01-02T06:00:00.000Z",
            "blockTime": 480,
            "flight": null
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As operations I can cancel a ready rotation without giving a reason
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/cancel"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "97f99ca3-6e34-4d99-8631-de754bad0b37",
        "name": "FRA-JFK-FRA 2025-01-02",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
        "status": "canceled",
        "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "updatedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "canceledBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "cancellationReason": null,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "@date('within 1 minute from now')",
        "canceledAt": "@date('within 1 minute from now')",
        "legs": [
          {
            "id": "d31970a7-9dda-4aee-8174-81da36756fd1",
            "flightNumber": "LH888",
            "departure": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
            "arrival": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
            "offBlockTime": "2025-01-01T12:00:00.000Z",
            "onBlockTime": "2025-01-01T20:00:00.000Z",
            "blockTime": 480,
            "flight": null
          },
          {
            "id": "b85748ad-710e-49a7-9102-a9b93cd4a989",
            "flightNumber": "LH41",
            "departure": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
            "arrival": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
            "offBlockTime": "2025-01-01T22:00:00.000Z",
            "onBlockTime": "2025-01-02T06:00:00.000Z",
            "blockTime": 480,
            "flight": null
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: I cannot cancel a rotation with a blank reason
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/cancel" with body:
      """json
      {
        "reason": ""
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "reason": ["reason should not be empty"]
        }
      }
      """

  Scenario: I cannot cancel a draft rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/cancel"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "Only a ready rotation can be canceled."
      }
      """

  Scenario: I cannot cancel an in-progress rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/d182d0f0-5b7d-4092-b6d9-0c3c11775a85/cancel"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "Only a ready rotation can be canceled."
      }
      """

  Scenario: I cannot cancel a finished rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/7f5f13b1-5f14-4418-af23-8128ff4f6410/cancel"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "Only a ready rotation can be canceled."
      }
      """

  Scenario: I cannot cancel a rotation that is already canceled
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/cancel"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/cancel"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "Only a ready rotation can be canceled."
      }
      """
    And I set database to initial state

  Scenario: Cancelling a rotation that does not exist returns not found
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/00000000-0000-4000-8000-000000000000/cancel"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Rotation with given ID not found."
      }
      """

  Scenario: As an admin I cannot cancel a rotation
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/cancel"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I cannot cancel a rotation
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/cancel"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot cancel a rotation
    When I send a "POST" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/cancel"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
