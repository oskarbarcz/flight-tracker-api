Feature: Delete runway

  Scenario: As an admin I cannot delete runway
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can delete runway
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/338cccf0-431c-44c5-99bf-ae1c8a8b372a"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/338cccf0-431c-44c5-99bf-ae1c8a8b372a"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Runway with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot delete runway
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot delete runway that does not belong to airport
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Runway with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot delete runway that does not exist
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/ffffffff-ffff-4fff-8fff-ffffffffffff"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Runway with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot delete runway
    When I send a "DELETE" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/0aaaf26f-29df-45d3-8330-f85f9838de2f"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
