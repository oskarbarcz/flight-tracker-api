Feature: Synchronise the cabin layout catalogue

  Scenario: Operations synchronises the catalogue from AeroLOPA
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "reported": 13,
        "catalogued": 12,
        "created": 12,
        "retired": 0,
        "restored": 0,
        "skipped": 0
      }
      """
    And I set database to initial state

  Scenario: Synchronising twice creates nothing the second time
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "reported": 13,
        "catalogued": 12,
        "created": 0,
        "retired": 0,
        "restored": 0,
        "skipped": 0
      }
      """
    And I set database to initial state

  Scenario: A double-deck aircraft is catalogued as one layout
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/cabin-layout/lh-74h"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "lh-74h",
        "airlineIata": "LH",
        "aircraftIata": "74H",
        "variant": null,
        "sourceSlugs": ["lh-74h-m", "lh-74h-u"],
        "firstSeenAt": "@date('within 1 minute from now')",
        "retiredAt": null
      }
      """
    And I set database to initial state

  Scenario: The deck of a merged layout is no longer a layout of its own
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/cabin-layout/lh-74h-m"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Cabin layout lh-74h-m does not exist."
      }
      """
    And I set database to initial state

  Scenario: A deck-marked layout without a sibling is catalogued unchanged
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/cabin-layout/sq-359-m"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "sq-359-m",
        "airlineIata": "SQ",
        "aircraftIata": "359",
        "variant": "m",
        "sourceSlugs": ["sq-359-m"],
        "firstSeenAt": "@date('within 1 minute from now')",
        "retiredAt": null
      }
      """
    And I set database to initial state

  Scenario: Admin cannot synchronise the catalogue
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: Cabin crew cannot synchronise the catalogue
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: An unauthorised actor cannot synchronise the catalogue
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
