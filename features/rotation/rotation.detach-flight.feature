Feature: Detach a flight from a rotation leg

  Scenario: As an admin I cannot detach a flight
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/rotation/de76f066-23a6-4a49-aa5e-e9d524f4efb8/leg/9c347301-fa9e-4c26-aa29-0295415053c8/flight"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I detach a created flight from a leg
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/de76f066-23a6-4a49-aa5e-e9d524f4efb8/leg/9c347301-fa9e-4c26-aa29-0295415053c8/flight"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "de76f066-23a6-4a49-aa5e-e9d524f4efb8",
        "name": "FRA-JFK-FRA 2025-01-03",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
        "status": "ready",
        "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "updatedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "canceledBy": null,
        "cancellationReason": null,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "@date('within 1 minute from now')",
        "canceledAt": null,
        "legs": [
          {
            "id": "9c347301-fa9e-4c26-aa29-0295415053c8",
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
            "id": "7037a573-2971-4fb6-8c34-8a98c9bc71c8",
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

  Scenario: As operations I detach a ready flight from a leg
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/2f4ac9bd-14ac-4af0-96a9-ec7666a3c808/leg/92c8e486-0bb5-4876-b894-75f0ca30ce61/flight"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "2f4ac9bd-14ac-4af0-96a9-ec7666a3c808",
        "name": "FRA-JFK-FRA 2025-02-03",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "629be07f-5e65-429a-9d69-d34b99185f50",
        "status": "ready",
        "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "updatedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "canceledBy": null,
        "cancellationReason": null,
        "createdAt": "2025-02-03T00:00:00.000Z",
        "updatedAt": "@date('within 1 minute from now')",
        "canceledAt": null,
        "legs": [
          {
            "id": "92c8e486-0bb5-4876-b894-75f0ca30ce61",
            "flightNumber": "LH81",
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
            "offBlockTime": "2025-02-03T12:00:00.000Z",
            "onBlockTime": "2025-02-03T20:00:00.000Z",
            "blockTime": 480,
            "flight": null
          },
          {
            "id": "1ccf9810-e3cc-4dca-90d8-323351c4fe64",
            "flightNumber": "LH42",
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
            "offBlockTime": "2025-02-03T22:00:00.000Z",
            "onBlockTime": "2025-02-04T06:00:00.000Z",
            "blockTime": 480,
            "flight": null
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot detach a flight
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/rotation/de76f066-23a6-4a49-aa5e-e9d524f4efb8/leg/9c347301-fa9e-4c26-aa29-0295415053c8/flight"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: A flight that has already checked in cannot be detached
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/d182d0f0-5b7d-4092-b6d9-0c3c11775a85/leg/69de1c35-96e1-4c0e-9b4c-c5777081f6e9/flight"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "message": "Leg cannot be modified because its flight has already checked in.",
        "error": "Conflict"
      }
      """

  Scenario: Detaching from a leg without a flight is rejected
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/d31970a7-9dda-4aee-8174-81da36756fd1/flight"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Leg has no attached flight.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As an unauthorized user I cannot detach a flight
    When I send a "DELETE" request to "/api/v1/rotation/de76f066-23a6-4a49-aa5e-e9d524f4efb8/leg/9c347301-fa9e-4c26-aa29-0295415053c8/flight"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
