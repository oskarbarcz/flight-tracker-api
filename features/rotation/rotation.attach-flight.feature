Feature: Attach a flight to a rotation leg

  Scenario: As an admin I cannot attach a flight
    Given I am signed in as "admin"
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/b85748ad-710e-49a7-9102-a9b93cd4a989/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I attach a created flight to a matching leg
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/b85748ad-710e-49a7-9102-a9b93cd4a989/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "97f99ca3-6e34-4d99-8631-de754bad0b37",
        "name": "FRA-JFK-FRA 2025-01-02",
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
            "id": "d31970a7-9dda-4aee-8174-81da36756fd1",
            "flightNumber": "LH888",
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
            "id": "b85748ad-710e-49a7-9102-a9b93cd4a989",
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
            "flight": { "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66", "flightNumber": "LH41", "status": "created" }
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As operations I attach a ready flight to a matching leg
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/2f4ac9bd-14ac-4af0-96a9-ec7666a3c808/leg/1ccf9810-e3cc-4dca-90d8-323351c4fe64/flight/006f0754-1ed7-4ae1-9f91-fae2d446a6e7"
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
            "flight": { "id": "11087d20-ead0-4b7e-97ee-f1ef0ea29e4f", "flightNumber": "LH81", "status": "ready" }
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
            "flight": { "id": "006f0754-1ed7-4ae1-9f91-fae2d446a6e7", "flightNumber": "LH42", "status": "ready" }
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As operations I attach a flight to a leg of a draft rotation
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/leg/916e6138-b189-4bb5-b23f-3f649e203bea/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "3e12423f-3add-4c0a-b594-07e0b32413e0",
        "name": "FRA-JFK-FRA 2025-01-01",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
        "status": "draft",
        "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "updatedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "canceledBy": null,
        "cancellationReason": null,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "@date('within 1 minute from now')",
        "canceledAt": null,
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
            "flight": { "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66", "flightNumber": "LH41", "status": "created" }
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot attach a flight
    Given I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/b85748ad-710e-49a7-9102-a9b93cd4a989/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: A flight that has already checked in cannot be attached
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/d31970a7-9dda-4aee-8174-81da36756fd1/flight/48760636-9520-4863-b32f-f3618556feb7"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Only a flight that has not checked in yet can be attached to a leg.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: A flight from another operator cannot be attached
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/d31970a7-9dda-4aee-8174-81da36756fd1/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Flight operator does not match the rotation operator.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: A flight whose route does not match the leg cannot be attached
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/d31970a7-9dda-4aee-8174-81da36756fd1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Flight departure and arrival do not match the leg plan.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: A flight whose number does not match the leg cannot be attached
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/d31970a7-9dda-4aee-8174-81da36756fd1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Flight number does not match the leg plan.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: A flight cannot be attached to a leg that already has one
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/de76f066-23a6-4a49-aa5e-e9d524f4efb8/leg/9c347301-fa9e-4c26-aa29-0295415053c8/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "message": "Flight is already attached to a leg.",
        "error": "Conflict"
      }
      """

  Scenario: A flight cannot be attached to a canceled rotation
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/4a2b2d48-798f-4260-a12e-5fa51ff0e900/leg/52bda472-6044-4f60-acae-e9d66aa4cb7f/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "message": "Flights cannot be attached or detached once the rotation is finished or canceled.",
        "error": "Conflict"
      }
      """

  Scenario: A flight cannot be attached to a finished rotation
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/9ab79d41-3db0-4068-98d6-5ec08641e899/leg/34b79875-00a8-485c-8fe3-309a9114003b/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "message": "Flights cannot be attached or detached once the rotation is finished or canceled.",
        "error": "Conflict"
      }
      """

  Scenario: As an unauthorized user I cannot attach a flight
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/b85748ad-710e-49a7-9102-a9b93cd4a989/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
