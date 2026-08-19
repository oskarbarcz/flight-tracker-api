Feature: Browse the cabin layout catalogue

  Background:
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 200

  Scenario: Operations filters the catalogue by airline
    When I send a "GET" request to "/api/v1/cabin-layout?airlineIata=LO"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "items": [
          {
            "id": "lo-7m8-1",
            "airlineIata": "LO",
            "aircraftIata": "7M8",
            "variant": "1",
            "sourceSlugs": ["lo-7m8-1"],
            "firstSeenAt": "@date('within 1 minute from now')",
            "retiredAt": null
          },
          {
            "id": "lo-7m8-2",
            "airlineIata": "LO",
            "aircraftIata": "7M8",
            "variant": "2",
            "sourceSlugs": ["lo-7m8-2"],
            "firstSeenAt": "@date('within 1 minute from now')",
            "retiredAt": null
          },
          {
            "id": "lo-7m8-3",
            "airlineIata": "LO",
            "aircraftIata": "7M8",
            "variant": "3",
            "sourceSlugs": ["lo-7m8-3"],
            "firstSeenAt": "@date('within 1 minute from now')",
            "retiredAt": null
          }
        ],
        "total": 3,
        "limit": 50,
        "offset": 0
      }
      """
    And I set database to initial state

  Scenario: Operations filters the catalogue by aircraft type
    When I send a "GET" request to "/api/v1/cabin-layout?aircraftIata=738"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "items": [
          {
            "id": "kl-738",
            "airlineIata": "KL",
            "aircraftIata": "738",
            "variant": null,
            "sourceSlugs": ["kl-738"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": null
          }
        ],
        "total": 1,
        "limit": 50,
        "offset": 0
      }
      """
    And I set database to initial state

  Scenario: Nothing has been withdrawn upstream
    When I send a "GET" request to "/api/v1/cabin-layout?retired=true"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "items": [],
        "total": 0,
        "limit": 50,
        "offset": 0
      }
      """
    And I set database to initial state

  Scenario: The catalogue is paged
    When I send a "GET" request to "/api/v1/cabin-layout?limit=2&offset=2"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "items": [
          {
            "id": "de-321",
            "airlineIata": "DE",
            "aircraftIata": "321",
            "variant": null,
            "sourceSlugs": ["de-321"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": null
          },
          {
            "id": "fi-752-1",
            "airlineIata": "FI",
            "aircraftIata": "752",
            "variant": "1",
            "sourceSlugs": ["fi-752-1"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": null
          }
        ],
        "total": 13,
        "limit": 2,
        "offset": 2
      }
      """
    And I set database to initial state

  Scenario: An out-of-range page size is rejected
    When I send a "GET" request to "/api/v1/cabin-layout?limit=999"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "error": "Bad Request",
        "message": "Request validation failed.",
        "violations": {
          "limit": ["limit must not be greater than 200"]
        }
      }
      """
    And I set database to initial state

  Scenario: Cabin crew can browse the catalogue
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/cabin-layout?aircraftIata=738"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "items": [
          {
            "id": "kl-738",
            "airlineIata": "KL",
            "aircraftIata": "738",
            "variant": null,
            "sourceSlugs": ["kl-738"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": null
          }
        ],
        "total": 1,
        "limit": 50,
        "offset": 0
      }
      """
    And I set database to initial state

  Scenario: Admin can browse the catalogue
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/cabin-layout?aircraftIata=738"
    Then the response status should be 200
    And I set database to initial state

  Scenario: An unauthorised actor cannot browse the catalogue
    When I send a "GET" request to "/api/v1/cabin-layout" with bearer token "invalid"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
    And I set database to initial state
