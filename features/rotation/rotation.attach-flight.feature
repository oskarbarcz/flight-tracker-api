Feature: Attach and detach rotation flights

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
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "@date('within 1 minute from now')",
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
            "flight": { "id": "e8e17e59-67d7-4a6c-a0bd-425ffa6bed66", "flightNumber": "LH41", "status": "created" }
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: A flight that is not created cannot be attached
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/d31970a7-9dda-4aee-8174-81da36756fd1/flight/48760636-9520-4863-b32f-f3618556feb7"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Only a created flight can be attached to a leg.",
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
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "@date('within 1 minute from now')",
        "legs": [
          {
            "id": "9c347301-fa9e-4c26-aa29-0295415053c8",
            "flightNumber": "LH450",
            "departure": { "id": "f35c094a-bec5-4803-be32-bd80a14b441a", "iataCode": "FRA", "icaoCode": "EDDF", "name": "Frankfurt Rhein/Main" },
            "arrival": { "id": "3c721cc6-c653-4fad-be43-dc9d6a149383", "iataCode": "JFK", "icaoCode": "KJFK", "name": "New York JFK" },
            "offBlockTime": "2025-01-01T12:00:00.000Z",
            "onBlockTime": "2025-01-01T20:00:00.000Z",
            "blockTime": 480,
            "flight": null
          },
          {
            "id": "7037a573-2971-4fb6-8c34-8a98c9bc71c8",
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

  Scenario: Unauthenticated I cannot attach a flight
    When I send a "PUT" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg/b85748ad-710e-49a7-9102-a9b93cd4a989/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
