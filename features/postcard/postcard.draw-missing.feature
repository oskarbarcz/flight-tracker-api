Feature: Draw art for every city that has none

  Scenario: As operations I draw only the art a city is still missing
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/postcard/draw-missing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "queued": 1,
        "cities": [
          {
            "id": "ec2d2121-804b-4f8f-a9d7-991ebd8465e8",
            "name": "Warsaw"
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As operations a draw already in flight is not started again
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/postcard/draw-missing"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/postcard/draw-missing"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "queued": 0,
        "cities": []
      }
      """
    And I set database to initial state

  Scenario: As an admin I cannot draw missing art
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/postcard/draw-missing"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I cannot draw missing art
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/postcard/draw-missing"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot draw missing art
    When I send a "POST" request to "/api/v1/postcard/draw-missing"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
