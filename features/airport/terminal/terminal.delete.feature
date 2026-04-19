Feature: Delete terminal

  Scenario: As an admin I cannot delete terminal
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 403

  Scenario: As operations I can delete terminal
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f"
    Then the response status should be 204
    And I set database to initial state

  Scenario: As a cabin crew I cannot delete terminal
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 403

  Scenario: As operations I cannot delete terminal that does not belong to airport
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Terminal with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot delete terminal that does not exist
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/ffffffff-ffff-4fff-8fff-ffffffffffff"
    Then the response status should be 404

  Scenario: As an unauthorized user I cannot delete terminal
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/d7fd7a84-1589-4a4f-9072-a9773f66e2b5"
    Then the response status should be 401
