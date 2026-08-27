Feature: Mark a postcard of mine as seen

  Scenario: As a cabin crew acknowledging a postcard ends its reveal
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/seen"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "057741fa-357e-462e-a5c6-0d4e6091c685",
        "city": {
          "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
          "name": "Frankfurt"
        },
        "country": {
          "code": "DE",
          "name": "Germany"
        },
        "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/dd8cd3b6-38bd-49b7-87f4-e03d8ec05147.png",
        "width": 1152,
        "height": 1536,
        "status": "ready",
        "awardedAt": "2025-01-03T11:45:00.000Z",
        "seenAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew acknowledging a postcard twice keeps the first moment
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/seen"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/seen"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "057741fa-357e-462e-a5c6-0d4e6091c685",
        "city": {
          "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
          "name": "Frankfurt"
        },
        "country": {
          "code": "DE",
          "name": "Germany"
        },
        "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/dd8cd3b6-38bd-49b7-87f4-e03d8ec05147.png",
        "width": 1152,
        "height": 1536,
        "status": "ready",
        "awardedAt": "2025-01-03T11:45:00.000Z",
        "seenAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot acknowledge a postcard I have not earned
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/me/postcard/78e684b8-a61e-40df-b0bc-1dc96c180267/seen"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Postcard with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an admin I cannot acknowledge a postcard I have not earned
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/seen"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Postcard with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot acknowledge a postcard
    When I send a "POST" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/seen"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
