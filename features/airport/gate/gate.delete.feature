Feature: Delete gate

  Scenario: As an admin I cannot delete gate
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can delete gate
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Gate with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot delete gate
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot delete gate that does not belong to airport
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Gate with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot delete gate that does not exist
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/ffffffff-ffff-4fff-8fff-ffffffffffff"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Gate with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot delete gate
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
