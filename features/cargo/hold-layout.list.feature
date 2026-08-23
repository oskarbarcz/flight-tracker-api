Feature: List aircraft hold layouts

  Scenario: As an admin I can list hold layouts
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/cargo-hold"
    Then the response status should be 200

  Scenario: As operations I can list hold layouts
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/cargo-hold"
    Then the response status should be 200

  Scenario: As a cabin crew member I can list hold layouts
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/cargo-hold"
    Then the response status should be 200

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
