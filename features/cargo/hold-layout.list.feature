Feature: List aircraft hold layouts

  Scenario: As an admin I can list hold layouts
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/cargo-hold"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        { "type": "B77W", "variants": "@any" },
        { "type": "A339", "variants": "@any" },
        { "type": "B752", "variants": "@any" },
        { "type": "B738", "variants": "@any" },
        { "type": "A320", "variants": "@any" },
        { "type": "A321", "variants": "@any" },
        { "type": "A319", "variants": "@any" },
        { "type": "B77F", "variants": "@any" },
        { "type": "B74F", "variants": "@any" },
        { "type": "B48F", "variants": "@any" },
        { "type": "B76F", "variants": "@any" },
        { "type": "B75F", "variants": "@any" },
        { "type": "MD1F", "variants": "@any" },
        { "type": "A30F", "variants": "@any" },
        { "type": "A3ST", "variants": "@any" },
        { "type": "A225", "variants": "@any" },
        { "type": "SH33", "variants": "@any" }
      ]
      """

  Scenario: As operations I can list hold layouts
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/cargo-hold"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        { "type": "B77W", "variants": "@any" },
        { "type": "A339", "variants": "@any" },
        { "type": "B752", "variants": "@any" },
        { "type": "B738", "variants": "@any" },
        { "type": "A320", "variants": "@any" },
        { "type": "A321", "variants": "@any" },
        { "type": "A319", "variants": "@any" },
        { "type": "B77F", "variants": "@any" },
        { "type": "B74F", "variants": "@any" },
        { "type": "B48F", "variants": "@any" },
        { "type": "B76F", "variants": "@any" },
        { "type": "B75F", "variants": "@any" },
        { "type": "MD1F", "variants": "@any" },
        { "type": "A30F", "variants": "@any" },
        { "type": "A3ST", "variants": "@any" },
        { "type": "A225", "variants": "@any" },
        { "type": "SH33", "variants": "@any" }
      ]
      """

  Scenario: As a cabin crew member I can list hold layouts
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/cargo-hold"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        { "type": "B77W", "variants": "@any" },
        { "type": "A339", "variants": "@any" },
        { "type": "B752", "variants": "@any" },
        { "type": "B738", "variants": "@any" },
        { "type": "A320", "variants": "@any" },
        { "type": "A321", "variants": "@any" },
        { "type": "A319", "variants": "@any" },
        { "type": "B77F", "variants": "@any" },
        { "type": "B74F", "variants": "@any" },
        { "type": "B48F", "variants": "@any" },
        { "type": "B76F", "variants": "@any" },
        { "type": "B75F", "variants": "@any" },
        { "type": "MD1F", "variants": "@any" },
        { "type": "A30F", "variants": "@any" },
        { "type": "A3ST", "variants": "@any" },
        { "type": "A225", "variants": "@any" },
        { "type": "SH33", "variants": "@any" }
      ]
      """

  Scenario: As an unauthorized user I cannot list hold layouts
    When I send a "GET" request to "/api/v1/cargo-hold"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
