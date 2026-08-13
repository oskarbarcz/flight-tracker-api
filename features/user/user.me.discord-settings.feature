Feature: Manage own Discord settings

  Scenario: As an admin I can read my Discord settings
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/discord-settings"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": true,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true
      }
      """

  Scenario: As a cabin crew I can read my Discord settings
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/discord-settings"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": true,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true
      }
      """

  Scenario: As an unauthorized user I cannot read Discord settings
    When I send a "GET" request to "/api/v1/user/me/discord-settings"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: As a cabin crew I can turn briefings off
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "briefingsEnabled": false
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": false,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true
      }
      """
    When I send a "GET" request to "/api/v1/user/me/discord-settings"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": false,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can turn briefings back on
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "briefingsEnabled": false
      }
      """
    Then the response status should be 200
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "briefingsEnabled": true
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": true,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can turn several messages off at once
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "preliminaryLoadsheetEnabled": false,
        "delayUpdatesEnabled": false
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": true,
        "preliminaryLoadsheetEnabled": false,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": false
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew changing one setting leaves the others alone
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "briefingsEnabled": false
      }
      """
    Then the response status should be 200
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "delayUpdatesEnabled": false
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": false,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": false
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew an empty payload changes nothing
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {}
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": true,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true
      }
      """

  Scenario: As an admin I can turn briefings off
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "briefingsEnabled": false
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": false,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot set a message to a value that is not a boolean
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "briefingsEnabled": "yes",
        "delayUpdatesEnabled": 1
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "briefingsEnabled": ["briefingsEnabled must be a boolean value"],
          "delayUpdatesEnabled": ["delayUpdatesEnabled must be a boolean value"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot change Discord settings
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "briefingsEnabled": false
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
