Feature: Manage rotation legs

  Scenario: As operations I add a leg to a draft rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/leg" with body:
      """json
      {
        "flightNumber": "LH900",
        "departureId": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
        "arrivalId": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
        "offBlockTime": "2025-01-03T10:00:00.000Z",
        "onBlockTime": "2025-01-03T12:00:00.000Z"
      }
      """
    Then the response status should be 201
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
          },
          {
            "id": "@uuid",
            "flightNumber": "LH900",
            "departure": {
              "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
              "iataCode": "BOS",
              "icaoCode": "KBOS",
              "name": "Boston Logan Intl"
            },
            "arrival": {
              "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
              "iataCode": "PHL",
              "icaoCode": "KPHL",
              "name": "Philadelphia Intl"
            },
            "offBlockTime": "2025-01-03T10:00:00.000Z",
            "onBlockTime": "2025-01-03T12:00:00.000Z",
            "blockTime": 120,
            "flight": null
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As operations I remove a leg from a draft rotation
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/leg/916e6138-b189-4bb5-b23f-3f649e203bea"
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
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As operations I retime a leg of a draft rotation
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/leg/34d72055-0f5c-4bd3-8e02-4db80131de48" with body:
      """json
      {
        "offBlockTime": "2025-01-01T13:00:00.000Z",
        "onBlockTime": "2025-01-01T21:00:00.000Z"
      }
      """
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
            "offBlockTime": "2025-01-01T13:00:00.000Z",
            "onBlockTime": "2025-01-01T21:00:00.000Z",
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

  Scenario: As operations I mark a draft rotation ready
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/ready"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "3e12423f-3add-4c0a-b594-07e0b32413e0",
        "name": "FRA-JFK-FRA 2025-01-01",
        "operatorId": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "pilotId": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
        "status": "ready",
        "createdBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
        "updatedBy": { "id": "721ab705-8608-4386-86b4-2f391a3655a7", "name": "Alice Doe" },
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

  Scenario: A rotation with fewer than two legs cannot be marked ready
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/a951b190-f022-415a-b02d-137905db140d/ready"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "A rotation must have at least two legs to be marked ready.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: A rotation with a broken airport chain cannot be marked ready
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/8459dc04-4cf9-46ba-a16f-226e677940b8/ready"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Each leg must depart from the previous leg arrival airport.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: A leg cannot be added to a ready rotation
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/97f99ca3-6e34-4d99-8631-de754bad0b37/leg" with body:
      """json
      {
        "flightNumber": "LH900",
        "departureId": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
        "arrivalId": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
        "offBlockTime": "2025-01-03T10:00:00.000Z",
        "onBlockTime": "2025-01-03T12:00:00.000Z"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "message": "Legs cannot be added or removed once the rotation is ready.",
        "error": "Conflict"
      }
      """

  Scenario: A leg whose departure equals its arrival is rejected
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/leg" with body:
      """json
      {
        "flightNumber": "LH900",
        "departureId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "arrivalId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "offBlockTime": "2025-01-03T10:00:00.000Z",
        "onBlockTime": "2025-01-03T12:00:00.000Z"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "Leg departure and arrival airports must differ.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """

  Scenario: As an admin I cannot add a leg
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/leg" with body:
      """json
      {
        "flightNumber": "LH900",
        "departureId": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
        "arrivalId": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
        "offBlockTime": "2025-01-03T10:00:00.000Z",
        "onBlockTime": "2025-01-03T12:00:00.000Z"
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

  Scenario: As a cabin crew I cannot mark a rotation ready
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/ready"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: Unauthenticated I cannot mark a rotation ready
    When I send a "POST" request to "/api/v1/rotation/3e12423f-3add-4c0a-b594-07e0b32413e0/ready"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
