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
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": false
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
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": false
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
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": false
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
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": false
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
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": false
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
        "delayUpdatesEnabled": false,
        "richPresenceEnabled": false
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can turn rich presence on
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": true
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": true,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": true
      }
      """
    When I send a "GET" request to "/api/v1/user/me/discord-settings"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": true,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can turn rich presence back off
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "richPresenceEnabled": false
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": true,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": false
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew turning rich presence on leaves the messages alone
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
        "richPresenceEnabled": true
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "briefingsEnabled": false,
        "preliminaryLoadsheetEnabled": true,
        "finalLoadsheetEnabled": true,
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": true
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
        "delayUpdatesEnabled": false,
        "richPresenceEnabled": false
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
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": false
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
        "delayUpdatesEnabled": true,
        "richPresenceEnabled": false
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot set a message to a value that is not a boolean
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/discord-settings" with body:
      """json
      {
        "briefingsEnabled": "yes",
        "delayUpdatesEnabled": 1,
        "richPresenceEnabled": "on"
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
          "delayUpdatesEnabled": ["delayUpdatesEnabled must be a boolean value"],
          "richPresenceEnabled": ["richPresenceEnabled must be a boolean value"]
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
