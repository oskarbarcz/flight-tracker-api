Feature: Delete parking position

  Scenario: As an admin I cannot delete parking position
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I can delete parking position
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ae098e8f-b088-41a6-a566-880c7dd5e931"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Parking position with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot delete parking position
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot delete parking position that does not belong to airport
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Parking position with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot delete parking position that does not exist
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/58c83720-fb20-4c84-b727-ba6dda14f8d1"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Parking position with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot delete parking position
    When I send a "DELETE" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
