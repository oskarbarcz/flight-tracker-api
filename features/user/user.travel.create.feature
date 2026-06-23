Feature: Request a manual dead-head travel

  Scenario: As a cabin crew I can travel to a different airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/fcf6f4bc-290d-43a9-843c-409cd47e143d/travel" with body:
      """json
      {
        "destinationAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      [
        {
          "id": "@uuid",
          "userId": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "type": "dead_head_manual",
          "status": "finished",
          "departureAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "name": "New York JFK",
            "iataCode": "JFK"
          },
          "destinationAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "name": "Frankfurt Rhein/Main",
            "iataCode": "FRA"
          },
          "distance": 3342,
          "flightId": null,
          "createdAt": "@date('within 1 minute from now')",
          "updatedAt": null
        },
        {
          "id": "7a000000-0000-4000-8000-0000000000a1",
          "userId": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "type": "performing_flight",
          "status": "pending",
          "departureAirport": {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "name": "Boston Logan Intl",
            "iataCode": "BOS"
          },
          "destinationAirport": {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "name": "Philadelphia Intl",
            "iataCode": "PHL"
          },
          "distance": 243,
          "flightId": "04be266c-df78-4bec-9f50-281cc02ce7f2",
          "createdAt": "2025-01-01T09:00:00.000Z",
          "updatedAt": null
        }
      ]
      """
    When I send a "GET" request to "/api/v1/user/me"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
        "name": "Rick Doe",
        "email": "cabin-crew@example.com",
        "role": "CabinCrew",
        "pilotLicenseId": "UK-31270",
        "currentFlightId": "b3899775-278e-4496-add1-21385a13d93e",
        "currentRotationId": null,
        "homeAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383",
        "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "lastAirportUpdatedAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot travel to the airport I am already at
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/fcf6f4bc-290d-43a9-843c-409cd47e143d/travel" with body:
      """json
      {
        "destinationAirportId": "3c721cc6-c653-4fad-be43-dc9d6a149383"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Travel destination must differ from the current airport.",
        "error": "Bad Request"
      }
      """

  Scenario: As a cabin crew I cannot request travel for another user
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/e181d983-3b69-4be2-864e-2a7596217ddf/travel" with body:
      """json
      {
        "destinationAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "message": "User is not allowed to access another user travel.",
        "error": "Forbidden"
      }
      """

  Scenario: As operations I cannot request cabin crew travel
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user/fcf6f4bc-290d-43a9-843c-409cd47e143d/travel" with body:
      """json
      {
        "destinationAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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

  Scenario: As an admin I cannot request cabin crew travel
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/fcf6f4bc-290d-43a9-843c-409cd47e143d/travel" with body:
      """json
      {
        "destinationAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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

  Scenario: As an unauthorized user I cannot request travel
    When I send a "POST" request to "/api/v1/user/fcf6f4bc-290d-43a9-843c-409cd47e143d/travel" with body:
      """json
      {
        "destinationAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a"
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
