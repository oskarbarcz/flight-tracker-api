Feature: Refresh a cabin layout from AeroLOPA

  Background:
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 200

  Scenario: Refreshing a layout whose cabin has not changed records no new revision
    When I send a "GET" request to "/api/v1/cabin-layout/de-321/seat-map"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/cabin-layout/de-321/refresh"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "layoutId": "de-321",
        "changed": false,
        "revision": 1
      }
      """
    And I set database to initial state

  Scenario: Refreshing a layout that has never been read stores its first revision
    When I send a "POST" request to "/api/v1/cabin-layout/fi-752-1/refresh"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "layoutId": "fi-752-1",
        "changed": true,
        "revision": 1
      }
      """
    And I set database to initial state

  Scenario: Refreshing repeatedly leaves the layout on one revision
    When I send a "POST" request to "/api/v1/cabin-layout/aa-77w/refresh"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/cabin-layout/aa-77w/refresh"
    Then the response status should be 200
    When I send a "POST" request to "/api/v1/cabin-layout/aa-77w/refresh"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "layoutId": "aa-77w",
        "changed": false,
        "revision": 1
      }
      """
    And I set database to initial state

  Scenario: A layout that is not catalogued cannot be refreshed
    When I send a "POST" request to "/api/v1/cabin-layout/zz-999/refresh"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Cabin layout zz-999 does not exist."
      }
      """
    And I set database to initial state

  Scenario: Admin cannot refresh a layout
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/cabin-layout/de-321/refresh"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: Cabin crew cannot refresh a layout
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/cabin-layout/de-321/refresh"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: An unauthorised actor cannot refresh a layout
    When I send a "POST" request to "/api/v1/cabin-layout/de-321/refresh" with bearer token "invalid"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
