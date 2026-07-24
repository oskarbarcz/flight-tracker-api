Feature: Edit rotation

  Scenario: As operations I can edit a draft rotation
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0" with body:
      """json
      {
        "name": "FRA-JFK-FRA edited",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "3e12423f-3add-4c0a-b594-07e0b32413e0",
        "name": "FRA-JFK-FRA edited",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "status": "draft",
        "createdBy": {
          "id": "721ab705-8608-4386-86b4-2f391a3655a7",
          "name": "Alice Doe"
        },
        "updatedBy": {
          "id": "721ab705-8608-4386-86b4-2f391a3655a7",
          "name": "Alice Doe"
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "@date('within 1 minute from now')",
        "legs": [
          {
            "id": "34d72055-0f5c-4bd3-8e02-4db80131de48",
            "flightNumber": "LH450",
            "departure": {
              "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
              "iataCode": "FRA",
              "icaoCode": "EDDF",
              "name": "Frankfurt Rhein/Main"
            },
            "arrival": {
              "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
              "iataCode": "JFK",
              "icaoCode": "KJFK",
              "name": "New York JFK"
            },
            "offBlockTime": "2025-01-01T12:00:00.000Z",
            "onBlockTime": "2025-01-01T20:00:00.000Z",
            "blockTime": 480,
            "flight": null
          },
          {
            "id": "916e6138-b189-4bb5-b23f-3f649e203bea",
            "flightNumber": "LH41",
            "departure": {
              "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
              "iataCode": "JFK",
              "icaoCode": "KJFK",
              "name": "New York JFK"
            },
            "arrival": {
              "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
              "iataCode": "FRA",
              "icaoCode": "EDDF",
              "name": "Frankfurt Rhein/Main"
            },
            "offBlockTime": "2025-01-01T22:00:00.000Z",
            "onBlockTime": "2025-01-02T06:00:00.000Z",
            "blockTime": 480,
            "flight": null
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot edit a rotation once it is ready
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37" with body:
      """json
      {
        "name": "should not apply",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "A rotation can only be edited while it is a draft."
      }
      """

  Scenario: Editing a rotation that does not exist returns not found
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/rotation/00000000-0000-4000-8000-000000000000" with body:
      """json
      {
        "name": "nope",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Rotation with given ID not found."
      }
      """

  Scenario: As an admin I cannot edit a rotation
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0" with body:
      """json
      {
        "name": "nope",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
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

  Scenario: As a cabin crew I cannot edit a rotation
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0" with body:
      """json
      {
        "name": "nope",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
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

  Scenario: As an unauthorized user I cannot edit a rotation
    When I send a "PATCH" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0" with body:
      """json
      {
        "name": "nope",
        "pilotId": "fcf6f4bc-290d-43a9-843c-409cd47e143d"
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
