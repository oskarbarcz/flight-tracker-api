Feature: Manage own GSX settings

  Scenario: As an admin I can read my GSX settings
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/gsx-settings"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": false,
        "autoBoardingEnabled": true,
        "autoDeboardingEnabled": true
      }
      """

  Scenario: As a cabin crew I can read my GSX settings
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/gsx-settings"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": false,
        "autoBoardingEnabled": true,
        "autoDeboardingEnabled": true
      }
      """

  Scenario: The Transponder can read the GSX settings of the pilot it signed in as
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/gsx-settings"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": false,
        "autoBoardingEnabled": true,
        "autoDeboardingEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I cannot read GSX settings
    When I send a "GET" request to "/api/v1/user/me/gsx-settings"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: As a cabin crew I can turn the GSX integration on
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": true,
        "autoBoardingEnabled": true,
        "autoDeboardingEnabled": true
      }
      """
    When I send a "GET" request to "/api/v1/user/me/gsx-settings"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": true,
        "autoBoardingEnabled": true,
        "autoDeboardingEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can turn automatic boarding off
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true,
        "autoBoardingEnabled": false
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": true,
        "autoBoardingEnabled": false,
        "autoDeboardingEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can turn automatic deboarding off
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true,
        "autoDeboardingEnabled": false
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": true,
        "autoBoardingEnabled": true,
        "autoDeboardingEnabled": false
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can turn automatic boarding back on
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "autoBoardingEnabled": false
      }
      """
    Then the response status should be 200
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "autoBoardingEnabled": true
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": false,
        "autoBoardingEnabled": true,
        "autoDeboardingEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew turning the integration off keeps the automatic settings
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true,
        "autoBoardingEnabled": false
      }
      """
    Then the response status should be 200
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": false
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": false,
        "autoBoardingEnabled": false,
        "autoDeboardingEnabled": true
      }
      """
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": true,
        "autoBoardingEnabled": false,
        "autoDeboardingEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew an empty payload changes nothing
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {}
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": false,
        "autoBoardingEnabled": true,
        "autoDeboardingEnabled": true
      }
      """

  Scenario: As a cabin crew my GSX settings do not touch my Discord settings
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true,
        "autoBoardingEnabled": false,
        "autoDeboardingEnabled": false
      }
      """
    Then the response status should be 200
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
    And I set database to initial state

  Scenario: As a cabin crew changing my GSX settings does not change another user's
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 200
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/gsx-settings"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "integrationEnabled": false,
        "autoBoardingEnabled": true,
        "autoDeboardingEnabled": true
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot set a GSX setting to a value that is not a boolean
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": "yes",
        "autoBoardingEnabled": 1,
        "autoDeboardingEnabled": "on"
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
          "integrationEnabled": ["integrationEnabled must be a boolean value"],
          "autoBoardingEnabled": ["autoBoardingEnabled must be a boolean value"],
          "autoDeboardingEnabled": ["autoDeboardingEnabled must be a boolean value"]
        }
      }
      """

  Scenario: As a cabin crew I cannot clear a GSX setting with null
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": null
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
          "integrationEnabled": ["integrationEnabled must be a boolean value"]
        }
      }
      """

  Scenario: The Transponder cannot change GSX settings
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "This action is not available to the Transponder.",
        "error": "Forbidden",
        "statusCode": 403
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I cannot change GSX settings
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
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
