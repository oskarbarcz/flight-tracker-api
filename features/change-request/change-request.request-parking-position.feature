Feature: Propose a change to a parking position

  Scenario: As a cabin crew I can propose ground power and coordinates for a parking position
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9/request-data-change" with body:
      """json
      {
        "gpu": "both",
        "coordinates": {
          "latitude": 50.04716,
          "longitude": 8.57431
        }
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "parkingPosition",
        "targetId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
        "changes": {
          "gpu": "both",
          "coordinates": {
            "latitude": 50.04716,
            "longitude": 8.57431
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
        "createdAt": "@date('within 1 minute from now')",
        "fields": [
          {
            "field": "gpu",
            "current": "bridge",
            "proposed": "both"
          },
          {
            "field": "coordinates",
            "current": {
              "latitude": 50.047131,
              "longitude": 8.574266
            },
            "proposed": {
              "latitude": 50.04716,
              "longitude": 8.57431
            }
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
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "B 42",
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

  Scenario: As a cabin crew I can propose moving a parking position to another terminal of the same airport
    Given I am signed in as "Alan Doe"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "parkingPosition",
        "targetId": "ae098e8f-b088-41a6-a566-880c7dd5e931",
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
        "createdAt": "@date('within 1 minute from now')",
        "fields": [
          {
            "field": "terminalId",
            "current": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
            "proposed": "26106c8a-aaee-4b84-bb6c-b5af3389e22f"
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot propose a terminal of another airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "terminalId": "104014ec-110e-483d-9f3c-8f6909fe4823"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Terminal with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot propose a change to a parking position through another airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "gpu": "both"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Parking position with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot propose a change to a parking position of an airport that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "gpu": "both"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Airport with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot propose an invalid value or another airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "gpu": "lots"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "airportId": ["property airportId should not exist"],
          "gpu": ["gpu must be one of the following values: no, bridge, standalone, both"]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose empty ground power or terminal
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "gpu": null,
        "terminalId": null
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "gpu": ["gpu must be one of the following values: no, bridge, standalone, both"],
          "terminalId": ["terminalId must be a UUID"]
        }
      }
      """

  Scenario: As a cabin crew I can propose removing the noise sensitivity notes of a parking position
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "noiseSensitivityText": null
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "parkingPosition",
        "targetId": "ae098e8f-b088-41a6-a566-880c7dd5e931",
        "changes": {
          "noiseSensitivityText": null
        },
        "status": "pending",
        "requestedBy": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe"
        },
        "decidedBy": null,
        "rejectionReason": null,
        "decidedAt": null,
        "createdAt": "@date('within 1 minute from now')",
        "fields": [
          {
            "field": "noiseSensitivityText",
            "current": "Night curfew: no engine runs or pushbacks permitted.",
            "proposed": null
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot propose a change that names no field
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {}
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "error": "Bad Request",
        "message": "A change request must propose at least one field."
      }
      """

  Scenario: As a cabin crew I cannot propose values equal to the current ones
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "gpu": "standalone",
        "noiseSensitivityStartTime": "21:00"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Every proposed value is equal to the value held now."
      }
      """

  Scenario: As an operations I cannot propose a change to a parking position
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "gpu": "both"
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

  Scenario: As an admin I cannot propose a change to a parking position
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "gpu": "both"
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

  Scenario: As an unauthorized user I cannot propose a change to a parking position
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931/request-data-change" with body:
      """json
      {
        "gpu": "both"
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
