Feature: List the change requests I proposed

  Scenario: As a cabin crew I can list my own change requests, newest first
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/data-change-request"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "8326750a-99ad-413e-8d9f-01f3974f05ef",
          "resource": "runway",
          "targetId": "32121288-2550-4b81-a558-9a7193ef6c97",
          "changes": {
            "lightingType": "ALS"
          },
          "status": "pending",
          "requestedBy": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-12T08:00:00.000Z"
        },
        {
          "id": "5f18eb02-d70f-4108-b057-80d0a5e6d078",
          "resource": "terminal",
          "targetId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "changes": {
            "operatorCodes": ["BAW", "AFR", "KLM"]
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
          "rejectionReason": "KLM operates from Terminal 1.",
          "decidedAt": "2026-09-11T11:00:00.000Z",
          "createdAt": "2026-09-11T10:00:00.000Z"
        },
        {
          "id": "a39dfa76-d9ed-4b1c-8767-767f5a27c634",
          "resource": "gate",
          "targetId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
          "changes": {
            "parkingPositionId": "77646d11-415c-4090-bc2b-e85cd1814b64"
          },
          "status": "pending",
          "requestedBy": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-08T08:00:00.000Z"
        },
        {
          "id": "e553f881-364c-42a1-99e5-cf49272bffb1",
          "resource": "parkingPosition",
          "targetId": "5537f377-dc35-41a9-9eda-c4db2f9a6431",
          "changes": {
            "location": "remote"
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
          "rejectionReason": "Stand 4 is a contact stand.",
          "decidedAt": "2026-09-07T11:00:00.000Z",
          "createdAt": "2026-09-07T10:00:00.000Z"
        },
        {
          "id": "5893d122-729a-4074-a336-db81dfe9122a",
          "resource": "parkingPosition",
          "targetId": "ae098e8f-b088-41a6-a566-880c7dd5e931",
          "changes": {
            "gpu": "both",
            "coordinates": {
              "latitude": 50.04891,
              "longitude": 8.57031
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
          "createdAt": "2026-09-04T08:00:00.000Z"
        },
        {
          "id": "c751e610-c091-4b05-ae1e-9b1ad86d6f61",
          "resource": "airport",
          "targetId": "93a9db1c-5047-489c-a018-178c3abd8a02",
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
          "status": "pending",
          "requestedBy": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-03T08:00:00.000Z"
        },
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
          "createdAt": "2026-09-01T10:00:00.000Z"
        },
        {
          "id": "683772a9-4b12-40d5-b7f4-33854fd93d3a",
          "resource": "airport",
          "targetId": "8b47e2d1-3f96-4c58-b0a7-6d2e9f1c4a83",
          "changes": {
            "name": "Gander International"
          },
          "status": "withdrawn",
          "requestedBy": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": "2026-08-26T10:00:00.000Z",
          "createdAt": "2026-08-25T10:00:00.000Z"
        },
        {
          "id": "61c109eb-1d4c-41b5-b25c-a2be96984793",
          "resource": "airport",
          "targetId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "changes": {
            "timezone": "Europe/Berlin"
          },
          "status": "accepted",
          "requestedBy": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "decidedBy": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "rejectionReason": null,
          "decidedAt": "2026-08-16T10:00:00.000Z",
          "createdAt": "2026-08-15T10:00:00.000Z"
        }
      ]
      """

  Scenario: As a cabin crew I can list only my pending change requests
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/data-change-request?status=pending"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "8326750a-99ad-413e-8d9f-01f3974f05ef",
          "resource": "runway",
          "targetId": "32121288-2550-4b81-a558-9a7193ef6c97",
          "changes": {
            "lightingType": "ALS"
          },
          "status": "pending",
          "requestedBy": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-12T08:00:00.000Z"
        },
        {
          "id": "a39dfa76-d9ed-4b1c-8767-767f5a27c634",
          "resource": "gate",
          "targetId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
          "changes": {
            "parkingPositionId": "77646d11-415c-4090-bc2b-e85cd1814b64"
          },
          "status": "pending",
          "requestedBy": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-08T08:00:00.000Z"
        },
        {
          "id": "5893d122-729a-4074-a336-db81dfe9122a",
          "resource": "parkingPosition",
          "targetId": "ae098e8f-b088-41a6-a566-880c7dd5e931",
          "changes": {
            "gpu": "both",
            "coordinates": {
              "latitude": 50.04891,
              "longitude": 8.57031
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
          "createdAt": "2026-09-04T08:00:00.000Z"
        },
        {
          "id": "c751e610-c091-4b05-ae1e-9b1ad86d6f61",
          "resource": "airport",
          "targetId": "93a9db1c-5047-489c-a018-178c3abd8a02",
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
          "status": "pending",
          "requestedBy": {
            "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
            "name": "Rick Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-03T08:00:00.000Z"
        },
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
          "createdAt": "2026-09-01T10:00:00.000Z"
        }
      ]
      """

  Scenario: As a cabin crew I can see why my change request was rejected
    Given I am signed in as "Alan Doe"
    When I send a "GET" request to "/api/v1/user/me/data-change-request?status=rejected"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
          "createdAt": "2026-08-20T10:00:00.000Z"
        }
      ]
      """

  Scenario: As a cabin crew I cannot filter my change requests by an unknown status
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/data-change-request?status=lost"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "status": ["status must be one of the following values: pending, accepted, rejected, withdrawn"]
        }
      }
      """

  Scenario: As an operations I cannot list my change requests
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user/me/data-change-request"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an admin I cannot list my change requests
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/data-change-request"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot list my change requests
    When I send a "GET" request to "/api/v1/user/me/data-change-request"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
