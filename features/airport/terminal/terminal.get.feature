Feature: Get terminal

  Scenario: As an admin I can get one terminal
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "shortName": "T1",
        "fullName": "Terminal 1",
        "averageTaxiTime": 12,
        "operatorCodes": ["DLH", "LOT"],
        "text": null,
        "shape": "@any"
      }
      """

  Scenario: As operations I can get one terminal
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 200

  Scenario: As a cabin crew I can get one terminal
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 200

  Scenario: As a cabin crew I cannot get terminal that does not belong to airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Terminal with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot get terminal of non-existing airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot get terminal with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot get one terminal
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
