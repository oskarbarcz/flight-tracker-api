Feature: Create gate

  Scenario: As an admin I cannot create gate
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "schengen"
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

  Scenario: As operations I can create gate
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "schengen"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "schengen",
        "parkingPositionId": null
      }
      """
    And I set database to initial state

  Scenario: As operations I can create gate linked to an existing parking position
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A21",
        "category": "non-schengen",
        "parkingPositionId": "77646d11-415c-4090-bc2b-e85cd1814b64"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A21",
        "category": "non-schengen",
        "parkingPositionId": "77646d11-415c-4090-bc2b-e85cd1814b64"
      }
      """
    And I set database to initial state

  Scenario: As operations I can create a second gate sharing a parking position with an existing gate
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A22",
        "category": "domestic",
        "parkingPositionId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A22",
        "category": "domestic",
        "parkingPositionId": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9"
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot create gate with a parking position that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "schengen",
        "parkingPositionId": "58c83720-fb20-4c84-b727-ba6dda14f8d1"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Parking position with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot create gate
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "schengen"
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

  Scenario: As operations I cannot create gate at non-existing airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "schengen"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot create gate when terminal does not belong to airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "schengen"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Terminal with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot create gate with incorrect data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "",
        "category": "schengen"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "name": ["name should not be empty"]
        }
      }
      """

  Scenario: As operations I cannot create gate with invalid category
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "eu"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "category": ["category must be one of the following values: schengen, non-schengen, domestic, international"]
        }
      }
      """

  Scenario: As operations I cannot create gate with invalid parking position id
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "schengen",
        "parkingPositionId": "not-a-uuid"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "parkingPositionId": ["parkingPositionId must be a UUID"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot create gate
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "category": "schengen"
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
