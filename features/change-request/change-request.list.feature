Feature: List the change request review queue

  Scenario: As an operations I can list every change request, oldest first
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user-data-change-request"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
        },
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
          "id": "6fb17bfe-1836-4aaa-b68c-ce72f5440871",
          "resource": "airport",
          "targetId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "changes": {
            "name": "Lotnisko Chopina"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-02T09:00:00.000Z"
        },
        {
          "id": "18b07434-9994-451c-aa41-bb45b8386c65",
          "resource": "airport",
          "targetId": "c39d6f52-84a1-4b73-9e6c-1f8a3d7b5e29",
          "changes": {
            "name": "Ireland West Airport Knock",
            "cityId": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-02T12:00:00.000Z"
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
          "id": "b0c0a3c7-c369-45ca-8306-8a434cfeac9c",
          "resource": "parkingPosition",
          "targetId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
          "changes": {
            "name": "B42",
            "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-05T08:00:00.000Z"
        },
        {
          "id": "bc9a705d-8fe9-4ee6-b7d3-01f2b9a0bfe2",
          "resource": "parkingPosition",
          "targetId": "3254f9a2-7680-41bb-89f1-962aa8065fa4",
          "changes": {
            "gpu": "both"
          },
          "status": "accepted",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "rejectionReason": null,
          "decidedAt": "2026-09-06T10:00:00.000Z",
          "createdAt": "2026-09-06T09:00:00.000Z"
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
        }
      ]
      """

  Scenario: As an operations I can list only pending change requests
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user-data-change-request?status=pending"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
          "id": "6fb17bfe-1836-4aaa-b68c-ce72f5440871",
          "resource": "airport",
          "targetId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "changes": {
            "name": "Lotnisko Chopina"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-02T09:00:00.000Z"
        },
        {
          "id": "18b07434-9994-451c-aa41-bb45b8386c65",
          "resource": "airport",
          "targetId": "c39d6f52-84a1-4b73-9e6c-1f8a3d7b5e29",
          "changes": {
            "name": "Ireland West Airport Knock",
            "cityId": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-02T12:00:00.000Z"
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
          "id": "b0c0a3c7-c369-45ca-8306-8a434cfeac9c",
          "resource": "parkingPosition",
          "targetId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
          "changes": {
            "name": "B42",
            "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-05T08:00:00.000Z"
        }
      ]
      """

  Scenario: As an operations I can list change requests of one kind of data
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user-data-change-request?resource=airport&status=rejected"
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

  Scenario: As an admin I can list every change request
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user-data-change-request"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
        },
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
          "id": "6fb17bfe-1836-4aaa-b68c-ce72f5440871",
          "resource": "airport",
          "targetId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "changes": {
            "name": "Lotnisko Chopina"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-02T09:00:00.000Z"
        },
        {
          "id": "18b07434-9994-451c-aa41-bb45b8386c65",
          "resource": "airport",
          "targetId": "c39d6f52-84a1-4b73-9e6c-1f8a3d7b5e29",
          "changes": {
            "name": "Ireland West Airport Knock",
            "cityId": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-02T12:00:00.000Z"
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
          "id": "b0c0a3c7-c369-45ca-8306-8a434cfeac9c",
          "resource": "parkingPosition",
          "targetId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
          "changes": {
            "name": "B42",
            "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-05T08:00:00.000Z"
        },
        {
          "id": "bc9a705d-8fe9-4ee6-b7d3-01f2b9a0bfe2",
          "resource": "parkingPosition",
          "targetId": "3254f9a2-7680-41bb-89f1-962aa8065fa4",
          "changes": {
            "gpu": "both"
          },
          "status": "accepted",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "rejectionReason": null,
          "decidedAt": "2026-09-06T10:00:00.000Z",
          "createdAt": "2026-09-06T09:00:00.000Z"
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
        }
      ]
      """

  Scenario: As an operations I can list parking position change requests only
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user-data-change-request?resource=parkingPosition"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
          "id": "b0c0a3c7-c369-45ca-8306-8a434cfeac9c",
          "resource": "parkingPosition",
          "targetId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
          "changes": {
            "name": "B42",
            "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f"
          },
          "status": "pending",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": null,
          "rejectionReason": null,
          "decidedAt": null,
          "createdAt": "2026-09-05T08:00:00.000Z"
        },
        {
          "id": "bc9a705d-8fe9-4ee6-b7d3-01f2b9a0bfe2",
          "resource": "parkingPosition",
          "targetId": "3254f9a2-7680-41bb-89f1-962aa8065fa4",
          "changes": {
            "gpu": "both"
          },
          "status": "accepted",
          "requestedBy": {
            "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
            "name": "Alan Doe"
          },
          "decidedBy": {
            "id": "721ab705-8608-4386-86b4-2f391a3655a7",
            "name": "Alice Doe"
          },
          "rejectionReason": null,
          "decidedAt": "2026-09-06T10:00:00.000Z",
          "createdAt": "2026-09-06T09:00:00.000Z"
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
        }
      ]
      """

  Scenario: As an operations I cannot filter by a kind of data that is not supported
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user-data-change-request?resource=runway"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "resource": ["resource must be one of the following values: airport, parkingPosition"]
        }
      }
      """

  Scenario: As a cabin crew I cannot list the change request review queue
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user-data-change-request"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot list the change request review queue
    When I send a "GET" request to "/api/v1/user-data-change-request"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
