Feature: Get one postcard I have collected

  Scenario: As a cabin crew I can read a postcard I hold
    Given I am signed in as "cabin crew"
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
        "seenAt": null
      }
      """

  Scenario: As a cabin crew a postcard I have not earned is not found
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/postcard/78e684b8-a61e-40df-b0bc-1dc96c180267"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Postcard with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an admin a postcard I have not earned is not found
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Postcard with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot read a postcard with an incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/postcard/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot read a postcard
    When I send a "GET" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
