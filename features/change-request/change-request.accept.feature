Feature: Accept a change request

  Scenario: As an operations I can accept a change request, applying its name and city
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/18b07434-9994-451c-aa41-bb45b8386c65/accept"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "18b07434-9994-451c-aa41-bb45b8386c65",
        "resource": "airport",
        "targetId": "c39d6f52-84a1-4b73-9e6c-1f8a3d7b5e29",
        "changes": {
          "name": "Ireland West Airport Knock",
          "cityId": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83"
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
        "decidedAt": "@date('within 1 minute from now')",
        "createdAt": "2026-09-02T12:00:00.000Z",
        "fields": [
          {
            "field": "name",
            "current": "Ireland West Airport Knock",
            "proposed": "Ireland West Airport Knock"
          },
          {
            "field": "cityId",
            "current": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83",
            "proposed": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83"
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/c39d6f52-84a1-4b73-9e6c-1f8a3d7b5e29"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "c39d6f52-84a1-4b73-9e6c-1f8a3d7b5e29",
        "icaoCode": "EIKN",
        "iataCode": "NOC",
        "city": {
          "id": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83",
          "name": "Shannon"
        },
        "name": "Ireland West Airport Knock",
        "country": {
          "code": "IE",
          "name": "Ireland"
        },
        "timezone": "Europe/Dublin",
        "location": {
          "latitude": 53.910278,
          "longitude": -8.818611
        },
        "continent": "europe",
        "dataQuality": "low",
        "shape": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: As an operations I can accept a change request without changing the airport grade
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/c751e610-c091-4b05-ae1e-9b1ad86d6f61/accept"
    Then the response status should be 200
    And the response body should contain:
      """json
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
        "decidedAt": "@date('within 1 minute from now')",
        "createdAt": "2026-09-03T08:00:00.000Z",
        "fields": [
          {
            "field": "shape",
            "current": [
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
            ],
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
    When I send a "GET" request to "/api/v1/airport/93a9db1c-5047-489c-a018-178c3abd8a02"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "93a9db1c-5047-489c-a018-178c3abd8a02",
        "icaoCode": "LFPO",
        "iataCode": "ORY",
        "city": {
          "id": "17c8f21f-b5a3-41f5-a1e3-16f4100c2342",
          "name": "Paris"
        },
        "name": "Paris Orly",
        "country": {
          "code": "FR",
          "name": "France"
        },
        "timezone": "Europe/Paris",
        "location": {
          "latitude": 48.7233,
          "longitude": 2.35944
        },
        "continent": "europe",
        "dataQuality": "low",
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
      }
      """
    And I set database to initial state

  Scenario: As an operations I accept a change request over a later direct edit
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046" with body:
      """json
      {
        "name": "Chopin"
      }
      """
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905/accept"
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
        "decidedAt": "@date('within 1 minute from now')",
        "createdAt": "2026-09-01T10:00:00.000Z",
        "fields": [
          {
            "field": "name",
            "current": "Warsaw Chopin Airport",
            "proposed": "Warsaw Chopin Airport"
          },
          {
            "field": "location",
            "current": {
              "latitude": 52.1657,
              "longitude": 20.9671
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
        "name": "Warsaw Chopin Airport",
        "country": {
          "code": "PL",
          "name": "Poland"
        },
        "timezone": "Europe/Warsaw",
        "location": {
          "latitude": 52.1657,
          "longitude": 20.9671
        },
        "continent": "europe",
        "dataQuality": "low",
        "shape": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: As an admin I can accept a change request to a flagship airport, which stays flagship
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046" with body:
      """json
      {
        "dataQuality": "flagship"
      }
      """
    Then the response status should be 200
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user-data-change-request/6fb17bfe-1836-4aaa-b68c-ce72f5440871/accept"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "6fb17bfe-1836-4aaa-b68c-ce72f5440871",
        "resource": "airport",
        "targetId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "changes": {
          "name": "Lotnisko Chopina"
        },
        "status": "accepted",
        "requestedBy": {
          "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "name": "Alan Doe"
        },
        "decidedBy": {
          "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
          "name": "John Doe"
        },
        "rejectionReason": null,
        "decidedAt": "@date('within 1 minute from now')",
        "createdAt": "2026-09-02T09:00:00.000Z",
        "fields": [
          {
            "field": "name",
            "current": "Lotnisko Chopina",
            "proposed": "Lotnisko Chopina"
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
        "name": "Lotnisko Chopina",
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
        "dataQuality": "flagship",
        "shape": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: As an operations I can accept a parking position change request, applying its name and terminal
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/b0c0a3c7-c369-45ca-8306-8a434cfeac9c/accept"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "b0c0a3c7-c369-45ca-8306-8a434cfeac9c",
        "resource": "parkingPosition",
        "targetId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
        "changes": {
          "name": "B42",
          "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f"
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
        "decidedAt": "@date('within 1 minute from now')",
        "createdAt": "2026-09-05T08:00:00.000Z",
        "fields": [
          {
            "field": "name",
            "current": "B42",
            "proposed": "B42"
          },
          {
            "field": "terminalId",
            "current": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
            "proposed": "26106c8a-aaee-4b84-bb6c-b5af3389e22f"
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
        "name": "B42",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "deicingDescription": null,
        "gpu": "bridge",
        "pca": "bridge",
        "type": "straight-in",
        "spotType": "passenger",
        "assistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "noiseSensitivityText": null,
        "noiseSensitivityStartTime": null,
        "noiseSensitivityEndTime": null,
        "fuelingOptions": "hydrant",
        "coordinates": {
          "latitude": 50.047131,
          "longitude": 8.574266
        }
      }
      """
    And I set database to initial state

  Scenario: As an operations I can accept a gate change request, applying its parking position
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/a39dfa76-d9ed-4b1c-8767-767f5a27c634/accept"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "a39dfa76-d9ed-4b1c-8767-767f5a27c634",
        "resource": "gate",
        "targetId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "changes": {
          "parkingPositionId": "77646d11-415c-4090-bc2b-e85cd1814b64"
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
        "decidedAt": "@date('within 1 minute from now')",
        "createdAt": "2026-09-08T08:00:00.000Z",
        "fields": [
          {
            "field": "parkingPositionId",
            "current": "77646d11-415c-4090-bc2b-e85cd1814b64",
            "proposed": "77646d11-415c-4090-bc2b-e85cd1814b64"
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A10",
        "category": "schengen",
        "parkingPositionId": "77646d11-415c-4090-bc2b-e85cd1814b64",
        "coordinates": {
          "latitude": 50.047131,
          "longitude": 8.574266
        }
      }
      """
    And I set database to initial state

  Scenario: As an operations I cannot accept a gate change request whose parking position was removed
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/77646d11-415c-4090-bc2b-e85cd1814b64"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/user-data-change-request/a39dfa76-d9ed-4b1c-8767-767f5a27c634/accept"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Parking position with given id does not exist."
      }
      """
    When I send a "GET" request to "/api/v1/user-data-change-request/a39dfa76-d9ed-4b1c-8767-767f5a27c634"
    Then the response status should be 200
    And the response body should contain:
      """json
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
        "createdAt": "2026-09-08T08:00:00.000Z",
        "fields": [
          {
            "field": "parkingPositionId",
            "current": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
            "proposed": "77646d11-415c-4090-bc2b-e85cd1814b64"
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A10",
        "category": "schengen",
        "parkingPositionId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
        "coordinates": {
          "latitude": 50.047131,
          "longitude": 8.574266
        }
      }
      """
    And I set database to initial state

  Scenario: As an operations I cannot accept a gate change request whose terminal was removed
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/user-data-change-request/68dbe9f1-fed8-4e71-b052-9911511afb5e/accept"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Terminal with given id does not exist."
      }
      """
    When I send a "GET" request to "/api/v1/user-data-change-request/68dbe9f1-fed8-4e71-b052-9911511afb5e"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "68dbe9f1-fed8-4e71-b052-9911511afb5e",
        "resource": "gate",
        "targetId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102",
        "changes": {
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
        "createdAt": "2026-09-14T08:00:00.000Z",
        "fields": [
          {
            "field": "terminalId",
            "current": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
            "proposed": "26106c8a-aaee-4b84-bb6c-b5af3389e22f"
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A11",
        "category": "schengen",
        "parkingPositionId": "ae098e8f-b088-41a6-a566-880c7dd5e931",
        "coordinates": {
          "latitude": 50.048797,
          "longitude": 8.569462
        }
      }
      """
    And I set database to initial state

  Scenario: As an admin I can accept a terminal change request, applying its taxi time
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user-data-change-request/583fc05f-9aa1-465e-ac0e-96ad7f65d008/accept"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "583fc05f-9aa1-465e-ac0e-96ad7f65d008",
        "resource": "terminal",
        "targetId": "104014ec-110e-483d-9f3c-8f6909fe4823",
        "changes": {
          "averageTaxiTime": 11
        },
        "status": "accepted",
        "requestedBy": {
          "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "name": "Alan Doe"
        },
        "decidedBy": {
          "id": "e181d983-3b69-4be2-864e-2a7596217ddf",
          "name": "John Doe"
        },
        "rejectionReason": null,
        "decidedAt": "@date('within 1 minute from now')",
        "createdAt": "2026-09-10T08:00:00.000Z",
        "fields": [
          {
            "field": "averageTaxiTime",
            "current": 11,
            "proposed": 11
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/terminal/104014ec-110e-483d-9f3c-8f6909fe4823"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "104014ec-110e-483d-9f3c-8f6909fe4823",
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "shortName": "TA",
        "fullName": "Terminal A",
        "averageTaxiTime": 11,
        "operatorCodes": ["LOT"],
        "text": null,
        "shape": [
          { "latitude": 52.174117, "longitude": 20.968171 },
          { "latitude": 52.174661, "longitude": 20.968454 },
          { "latitude": 52.174471, "longitude": 20.969416 },
          { "latitude": 52.174285, "longitude": 20.968993 },
          { "latitude": 52.174073, "longitude": 20.969785 },
          { "latitude": 52.173697, "longitude": 20.969503 },
          { "latitude": 52.173771, "longitude": 20.970048 },
          { "latitude": 52.173374, "longitude": 20.969782 },
          { "latitude": 52.173447, "longitude": 20.970336 },
          { "latitude": 52.173031, "longitude": 20.970079 },
          { "latitude": 52.173107, "longitude": 20.970639 },
          { "latitude": 52.172979, "longitude": 20.970124 },
          { "latitude": 52.172837, "longitude": 20.970864 },
          { "latitude": 52.172392, "longitude": 20.970633 },
          { "latitude": 52.172859, "longitude": 20.972046 },
          { "latitude": 52.171834, "longitude": 20.97294 },
          { "latitude": 52.171234, "longitude": 20.970438 },
          { "latitude": 52.171346, "longitude": 20.970923 },
          { "latitude": 52.171744, "longitude": 20.969994 },
          { "latitude": 52.171857, "longitude": 20.970476 }
        ]
      }
      """
    And I set database to initial state

  Scenario: As an operations I can accept a runway change request, applying its lighting type
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/8326750a-99ad-413e-8d9f-01f3974f05ef/accept"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "8326750a-99ad-413e-8d9f-01f3974f05ef",
        "resource": "runway",
        "targetId": "32121288-2550-4b81-a558-9a7193ef6c97",
        "changes": {
          "lightingType": "ALS"
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
        "decidedAt": "@date('within 1 minute from now')",
        "createdAt": "2026-09-12T08:00:00.000Z",
        "fields": [
          {
            "field": "lightingType",
            "current": "ALS",
            "proposed": "ALS"
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "32121288-2550-4b81-a558-9a7193ef6c97",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "designator": "07C",
        "length": 4000,
        "width": 60,
        "displace": null,
        "trueHeading": 70,
        "magneticHeading": 72,
        "elevation": 111,
        "surfaceType": "asphalt",
        "lightingType": "ALS",
        "coordinates": {
          "latitude": 50.0326,
          "longitude": 8.53463
        }
      }
      """
    And I set database to initial state

  Scenario: As an operations I cannot accept a change request that is already rejected
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/11fd5e75-3857-424e-ab48-310a29f0d7ce/accept"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "This change request has already been decided or withdrawn."
      }
      """

  Scenario: As an operations I cannot accept a withdrawn change request
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/683772a9-4b12-40d5-b7f4-33854fd93d3a/accept"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "This change request has already been decided or withdrawn."
      }
      """

  Scenario: As an operations I cannot accept a change request that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c/accept"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Change request with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot accept a change request
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905/accept"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot accept a change request
    When I send a "POST" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905/accept"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
