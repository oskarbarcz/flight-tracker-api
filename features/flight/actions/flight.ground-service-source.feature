Feature: Name the source of boarding and offboarding steps

  Scenario Outline: As a cabin crew starting boarding myself is recorded as <source>
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": <integration>,
        "autoBoardingEnabled": <automatic>
      }
      """
    Then the response status should be 200
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "b3899775-278e-4496-add1-21385a13d93e"
    Then I should receive flight event history within 2000ms
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding"
    Then the response status should be 204
    And I should receive a live flight event of type "flight.boarding-started" within 2000ms
    And the received live flight events should contain:
      """json
      [
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": { "source": "<source>" },
          "actor": "@any",
          "createdAt": "@any"
        }
      ]
      """
    And I set database to initial state

    Examples:
      | integration | automatic | source   |
      | false       | false     | manual   |
      | false       | true      | manual   |
      | true        | false     | manual   |
      | true        | true      | override |

  Scenario Outline: As a cabin crew starting offboarding myself is recorded as <source>
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": <integration>,
        "autoBoardingEnabled": <boarding>,
        "autoDeboardingEnabled": <deboarding>
      }
      """
    Then the response status should be 200
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "17d2f703-957d-4ad1-a620-3c187a70c26a"
    Then I should receive flight event history within 2000ms
    When I send a "POST" request to "/api/v1/flight/17d2f703-957d-4ad1-a620-3c187a70c26a/start-offboarding"
    Then the response status should be 204
    And I should receive a live flight event of type "flight.offboarding-started" within 2000ms
    And the received live flight events should contain:
      """json
      [
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.offboarding-started",
          "payload": { "source": "<source>" },
          "actor": "@any",
          "createdAt": "@any"
        }
      ]
      """
    And I set database to initial state

    Examples:
      | integration | boarding | deboarding | source   |
      | false       | true     | true       | manual   |
      | true        | true     | false      | manual   |
      | true        | false    | true       | override |

  Scenario: As a cabin crew starting boarding from GSX is recorded as gsx
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 200
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "b3899775-278e-4496-add1-21385a13d93e"
    Then I should receive flight event history within 2000ms
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding" with body:
      """json
      {
        "source": "gsx"
      }
      """
    Then the response status should be 204
    And I should receive a live flight event of type "flight.boarding-started" within 2000ms
    And the received live flight events should contain:
      """json
      [
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.boarding-started",
          "payload": { "source": "gsx" },
          "actor": "@any",
          "createdAt": "@any"
        }
      ]
      """
    And I set database to initial state

  Scenario: As a cabin crew starting offboarding from GSX is recorded as gsx
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 200
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "17d2f703-957d-4ad1-a620-3c187a70c26a"
    Then I should receive flight event history within 2000ms
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/17d2f703-957d-4ad1-a620-3c187a70c26a/start-offboarding" with body:
      """json
      {
        "source": "gsx"
      }
      """
    Then the response status should be 204
    And I should receive a live flight event of type "flight.offboarding-started" within 2000ms
    And the received live flight events should contain:
      """json
      [
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.offboarding-started",
          "payload": { "source": "gsx" },
          "actor": "@any",
          "createdAt": "@any"
        }
      ]
      """
    And I set database to initial state

  Scenario Outline: As a cabin crew GSX cannot start boarding while the settings do not allow it
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": <integration>,
        "autoBoardingEnabled": <automatic>
      }
      """
    Then the response status should be 200
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding" with body:
      """json
      {
        "source": "gsx"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "GSX cannot do this, because its GSX setting is off.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding"
    Then the response status should be 204
    And I set database to initial state

    Examples:
      | integration | automatic |
      | false       | true      |
      | true        | false     |

  Scenario: As a cabin crew GSX cannot start offboarding while the setting is off
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true,
        "autoDeboardingEnabled": false
      }
      """
    Then the response status should be 200
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/17d2f703-957d-4ad1-a620-3c187a70c26a/start-offboarding" with body:
      """json
      {
        "source": "gsx"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "GSX cannot do this, because its GSX setting is off.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew GSX cannot start boarding twice
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding"
    Then the response status should be 204
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding" with body:
      """json
      {
        "source": "gsx"
      }
      """
    Then the response status should be 422
    And I set database to initial state

  Scenario Outline: As a cabin crew I cannot claim any source other than GSX
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding" with body:
      """json
      {
        "source": <source>
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
          "source": ["source must be one of the following values: gsx"]
        }
      }
      """

    Examples:
      | source     |
      | "manual"   |
      | "override" |
      | null       |

  Scenario: As a cabin crew an empty body starts boarding as usual
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/start-boarding" with body:
      """json
      {}
      """
    Then the response status should be 204
    And I set database to initial state

  Scenario Outline: As a cabin crew finishing offboarding myself is recorded as <source>
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": <integration>,
        "autoBoardingEnabled": <boarding>,
        "autoDeboardingEnabled": <deboarding>
      }
      """
    Then the response status should be 200
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "5aada8ba-60c1-4e93-bcee-b59a7c555fdd"
    Then I should receive flight event history within 2000ms
    When I send a "POST" request to "/api/v1/flight/5aada8ba-60c1-4e93-bcee-b59a7c555fdd/finish-offboarding"
    Then the response status should be 204
    And I should receive a live flight event of type "flight.offboarding-finished" within 2000ms
    And the received live flight events should contain:
      """json
      [
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.offboarding-finished",
          "payload": { "source": "<source>" },
          "actor": "@any",
          "createdAt": "@any"
        }
      ]
      """
    And I set database to initial state

    Examples:
      | integration | boarding | deboarding | source   |
      | false       | true     | true       | manual   |
      | true        | true     | false      | manual   |
      | true        | false    | true       | override |

  Scenario: As a cabin crew finishing offboarding from GSX is recorded as gsx
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 200
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "5aada8ba-60c1-4e93-bcee-b59a7c555fdd"
    Then I should receive flight event history within 2000ms
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/5aada8ba-60c1-4e93-bcee-b59a7c555fdd/finish-offboarding" with body:
      """json
      {
        "source": "gsx"
      }
      """
    Then the response status should be 204
    And I should receive a live flight event of type "flight.offboarding-finished" within 2000ms
    And the received live flight events should contain:
      """json
      [
        {
          "id": "@uuid",
          "scope": "user",
          "type": "flight.offboarding-finished",
          "payload": { "source": "gsx" },
          "actor": "@any",
          "createdAt": "@any"
        }
      ]
      """
    And I set database to initial state

  Scenario Outline: As a cabin crew GSX cannot finish offboarding while the settings do not allow it
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": <integration>,
        "autoDeboardingEnabled": <automatic>
      }
      """
    Then the response status should be 200
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/5aada8ba-60c1-4e93-bcee-b59a7c555fdd/finish-offboarding" with body:
      """json
      {
        "source": "gsx"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "message": "GSX cannot do this, because its GSX setting is off.",
        "error": "Unprocessable Content",
        "statusCode": 422
      }
      """
    When I send a "POST" request to "/api/v1/flight/5aada8ba-60c1-4e93-bcee-b59a7c555fdd/finish-offboarding"
    Then the response status should be 204
    And I set database to initial state

    Examples:
      | integration | automatic |
      | false       | true      |
      | true        | false     |

  Scenario: As a cabin crew GSX cannot finish offboarding twice
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/flight/5aada8ba-60c1-4e93-bcee-b59a7c555fdd/finish-offboarding"
    Then the response status should be 204
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/5aada8ba-60c1-4e93-bcee-b59a7c555fdd/finish-offboarding" with body:
      """json
      {
        "source": "gsx"
      }
      """
    Then the response status should be 422
    And I set database to initial state

  Scenario: As a cabin crew I cannot claim any other source when finishing offboarding
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/5aada8ba-60c1-4e93-bcee-b59a7c555fdd/finish-offboarding" with body:
      """json
      {
        "source": "override"
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
          "source": ["source must be one of the following values: gsx"]
        }
      }
      """

  Scenario Outline: As a cabin crew in the browser I cannot claim GSX as the source of <action>
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/user/me/gsx-settings" with body:
      """json
      {
        "integrationEnabled": true
      }
      """
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/flight/<flightId>/<action>" with body:
      """json
      {
        "source": "gsx"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Only the Transponder can report GSX as the source.",
        "error": "Forbidden",
        "statusCode": 403
      }
      """
    And I set database to initial state

    Examples:
      | action             | flightId                             |
      | start-boarding     | b3899775-278e-4496-add1-21385a13d93e |
      | start-offboarding  | 17d2f703-957d-4ad1-a620-3c187a70c26a |
      | finish-offboarding | 5aada8ba-60c1-4e93-bcee-b59a7c555fdd |
