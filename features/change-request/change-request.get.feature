Feature: Retrieve one change request

  Scenario: As an operations I can see the current and proposed values of a pending change request
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "acd93eae-b731-4794-9060-b7652bbc9905",
        "resource": "airport",
        "targetId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "changes": {
          "name": "Warsaw Chopin Airport",
          "location": {
            "latitude": 52.1657,
            "longitude": 20.9671
          }
        },
        "status": "pending",
        "requestedBy": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe"
        },
        "decidedBy": null,
        "rejectionReason": null,
        "decidedAt": null,
        "createdAt": "2026-09-01T10:00:00.000Z",
        "fields": [
          {
            "field": "name",
            "current": "Warsaw Chopin",
            "proposed": "Warsaw Chopin Airport"
          },
          {
            "field": "location",
            "current": {
              "latitude": 52.16575,
              "longitude": 20.967123
            },
            "proposed": {
              "latitude": 52.1657,
              "longitude": 20.9671
            }
          }
        ]
      }
      """

  Scenario: As an admin I can see a rejected change request
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user-data-change-request/11fd5e75-3857-424e-ab48-310a29f0d7ce"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "11fd5e75-3857-424e-ab48-310a29f0d7ce",
        "resource": "airport",
        "targetId": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
        "changes": {
          "continent": "europe"
        },
        "status": "rejected",
        "requestedBy": {
          "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "name": "Alan Doe"
        },
        "decidedBy": {
          "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
          "name": "John Doe"
        },
        "rejectionReason": "Boston is in North America.",
        "decidedAt": "2026-08-21T10:00:00.000Z",
        "createdAt": "2026-08-20T10:00:00.000Z",
        "fields": [
          {
            "field": "continent",
            "current": "north_america",
            "proposed": "europe"
          }
        ]
      }
      """

  Scenario: As an operations I see the value held now after the airport changed
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046" with body:
      """json
      {
        "name": "Chopin"
      }
      """
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "acd93eae-b731-4794-9060-b7652bbc9905",
        "resource": "airport",
        "targetId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "changes": {
          "name": "Warsaw Chopin Airport",
          "location": {
            "latitude": 52.1657,
            "longitude": 20.9671
          }
        },
        "status": "pending",
        "requestedBy": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe"
        },
        "decidedBy": null,
        "rejectionReason": null,
        "decidedAt": null,
        "createdAt": "2026-09-01T10:00:00.000Z",
        "fields": [
          {
            "field": "name",
            "current": "Chopin",
            "proposed": "Warsaw Chopin Airport"
          },
          {
            "field": "location",
            "current": {
              "latitude": 52.16575,
              "longitude": 20.967123
            },
            "proposed": {
              "latitude": 52.1657,
              "longitude": 20.9671
            }
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As an operations I cannot see a change request that does not exist
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user-data-change-request/0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Change request with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot see a change request
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot see a change request
    When I send a "GET" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
