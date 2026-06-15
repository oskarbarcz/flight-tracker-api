Feature: Update terminal

  Scenario: As an admin I cannot update terminal
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5" with body:
      """json
      { "averageTaxiTime": 20 }
      """
    Then the response status should be 403

  Scenario: As operations I can update terminal
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5" with body:
      """json
      {
        "fullName": "Terminal 1 (renovated)",
        "averageTaxiTime": 20,
        "operatorCodes": ["DLH", "LOT", "KLM"],
        "text": "Renovated in 2026. New jet-bridges on all gates."
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "shortName": "T1",
        "fullName": "Terminal 1 (renovated)",
        "averageTaxiTime": 20,
        "operatorCodes": ["DLH", "LOT", "KLM"],
        "text": "Renovated in 2026. New jet-bridges on all gates.",
        "shape": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot update terminal
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5" with body:
      """json
      { "averageTaxiTime": 20 }
      """
    Then the response status should be 403

  Scenario: As operations I cannot update terminal that does not belong to airport
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5" with body:
      """json
      { "averageTaxiTime": 20 }
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

  Scenario: As operations I cannot update terminal with invalid data
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5" with body:
      """json
      { "averageTaxiTime": -1 }
      """
    Then the response status should be 400
    And the response body should have the property "violations"

  Scenario: As an unauthorized user I cannot update terminal
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5" with body:
      """json
      { "averageTaxiTime": 20 }
      """
    Then the response status should be 401
