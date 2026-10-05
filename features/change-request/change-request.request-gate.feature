Feature: Propose a change to a gate

  Scenario: As a cabin crew I can propose a parking position and coordinates for a gate
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "parkingPositionId": "77646d11-415c-4090-bc2b-e85cd1814b64",
        "coordinates": {
          "latitude": 50.0472,
          "longitude": 8.5743
        }
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "gate",
        "targetId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "changes": {
          "parkingPositionId": "77646d11-415c-4090-bc2b-e85cd1814b64",
          "coordinates": {
            "latitude": 50.0472,
            "longitude": 8.5743
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
            "field": "parkingPositionId",
            "current": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
            "proposed": "77646d11-415c-4090-bc2b-e85cd1814b64"
          },
          {
            "field": "coordinates",
            "current": {
              "latitude": 50.047131,
              "longitude": 8.574266
            },
            "proposed": {
              "latitude": 50.0472,
              "longitude": 8.5743
            }
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

  Scenario: As a cabin crew I can propose unlinking a gate from its parking position
    Given I am signed in as "Alan Doe"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "parkingPositionId": null
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "gate",
        "targetId": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "changes": {
          "parkingPositionId": null
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
            "field": "parkingPositionId",
            "current": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
            "proposed": null
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot propose a parking position of another airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "parkingPositionId": "5537f377-dc35-41a9-9eda-c4db2f9a6431"
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

  Scenario: As a cabin crew I cannot propose a terminal of another airport for a gate
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
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

  Scenario: As a cabin crew I cannot propose a change to a gate through another airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "name": "A12"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Gate with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot propose a change to a gate of an airport that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "name": "A12"
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

  Scenario: As a cabin crew I cannot propose an invalid gate value or another airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "category": "orbital"
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
          "category": ["category must be one of the following values: schengen, non-schengen, domestic, international"]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose an empty name for a gate
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "name": null
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
          "name": [
            "name must be shorter than or equal to 16 characters",
            "name should not be empty",
            "name must be a string"
          ]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose a gate change that names no field
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
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

  Scenario: As a cabin crew I cannot propose gate values equal to the current ones
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "name": "A10",
        "category": "schengen",
        "coordinates": {
          "latitude": 50.047131,
          "longitude": 8.574266
        }
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

  Scenario: As an operations I cannot propose a change to a gate
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "name": "A12"
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

  Scenario: As an admin I cannot propose a change to a gate
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "name": "A12"
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

  Scenario: As an unauthorized user I cannot propose a change to a gate
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101/request-data-change" with body:
      """json
      {
        "name": "A12"
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
