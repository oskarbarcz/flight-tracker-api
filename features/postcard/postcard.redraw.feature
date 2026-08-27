Feature: Replace a postcard's art

  Scenario: As operations replacing art gives every holder new art without a second reveal
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/user/me/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/seen"
    Then the response status should be 204
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/redraw"
    Then the response status should be 204
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
        "imageUrl": "@any",
        "width": 1152,
        "height": 1536,
        "status": "ready",
        "awardedAt": "2025-01-03T11:45:00.000Z",
        "seenAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot replace art for a postcard that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/postcard/b19547a8-393d-46d3-8fae-aef51e8c860d/redraw"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Postcard with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an admin I cannot replace a postcard's art
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/redraw"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I cannot replace a postcard's art
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/redraw"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot replace a postcard's art
    When I send a "POST" request to "/api/v1/postcard/057741fa-357e-462e-a5c6-0d4e6091c685/redraw"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
