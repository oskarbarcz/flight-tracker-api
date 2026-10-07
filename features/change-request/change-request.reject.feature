Feature: Reject a change request

  Scenario: As an admin I can reject a change request, leaving the airport unchanged
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905/reject" with body:
      """json
      {
        "rejectionReason": "The current name is the official one."
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "acd93eae-b731-4794-9060-b7652bbc9905",
        "resource": "airport",
        "targetId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "target": {
          "label": "Warsaw Chopin",
          "airport": {
            "id": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
            "icaoCode": "EPWA",
            "iataCode": "WAW",
            "name": "Warsaw Chopin"
          }
        },
        "changes": {
          "name": "Warsaw Chopin Airport",
          "location": {
            "latitude": 52.1657,
            "longitude": 20.9671
          }
        },
        "status": "rejected",
        "requestedBy": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe"
        },
        "decidedBy": {
          "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
          "name": "John Doe"
        },
        "rejectionReason": "The current name is the official one.",
        "decidedAt": "@date('within 1 minute from now')",
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
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "icaoCode": "EPWA",
        "iataCode": "WAW",
        "city": {
          "id": "ec2d2121-804b-4f8f-a9d7-991ebd8465e8",
          "name": "Warsaw"
        },
        "name": "Warsaw Chopin",
        "country": {
          "code": "PL",
          "name": "Poland"
        },
        "timezone": "Europe/Warsaw",
        "location": {
          "latitude": 52.16575,
          "longitude": 20.967123
        },
        "continent": "europe",
        "dataQuality": "low",
        "shape": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: As an operations I can reject a change request
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/c751e610-c091-4b05-ae1e-9b1ad86d6f61/reject" with body:
      """json
      {
        "rejectionReason": "The boundary does not match the aerodrome."
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "c751e610-c091-4b05-ae1e-9b1ad86d6f61",
        "resource": "airport",
        "targetId": "93a9db1c-5047-489c-a018-178c3abd8a02",
        "target": {
          "label": "Paris Orly",
          "airport": {
            "id": "93a9db1c-5047-489c-a018-178c3abd8a02",
            "icaoCode": "LFPO",
            "iataCode": "ORY",
            "name": "Paris Orly"
          }
        },
        "changes": {
          "shape": [
            {
              "latitude": 48.7389,
              "longitude": 2.3355
            },
            {
              "latitude": 48.7389,
              "longitude": 2.4012
            },
            {
              "latitude": 48.7101,
              "longitude": 2.4012
            },
            {
              "latitude": 48.7101,
              "longitude": 2.3355
            }
          ]
        },
        "status": "rejected",
        "requestedBy": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe"
        },
        "decidedBy": {
          "id": "721ab705-8608-4386-86b4-2f391a3655a7",
          "name": "Alice Doe"
        },
        "rejectionReason": "The boundary does not match the aerodrome.",
        "decidedAt": "@date('within 1 minute from now')",
        "createdAt": "2026-09-03T08:00:00.000Z",
        "fields": [
          {
            "field": "shape",
            "current": null,
            "proposed": [
              {
                "latitude": 48.7389,
                "longitude": 2.3355
              },
              {
                "latitude": 48.7389,
                "longitude": 2.4012
              },
              {
                "latitude": 48.7101,
                "longitude": 2.4012
              },
              {
                "latitude": 48.7101,
                "longitude": 2.3355
              }
            ]
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As an operations I cannot reject a change request without a reason
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905/reject" with body:
      """json
      {}
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "rejectionReason": ["rejectionReason should not be empty", "rejectionReason must be a string"]
        }
      }
      """

  Scenario: As an operations I cannot reject a change request that is already accepted
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/61c109eb-1d4c-41b5-b25c-a2be96984793/reject" with body:
      """json
      {
        "rejectionReason": "Too late."
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "This change request has already been decided or withdrawn."
      }
      """

  Scenario: As an operations I cannot reject a change request that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c/reject" with body:
      """json
      {
        "rejectionReason": "Wrong."
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Change request with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot reject a change request
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905/reject" with body:
      """json
      {
        "rejectionReason": "Wrong."
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

  Scenario: As an unauthorized user I cannot reject a change request
    When I send a "POST" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905/reject" with body:
      """json
      {
        "rejectionReason": "Wrong."
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
