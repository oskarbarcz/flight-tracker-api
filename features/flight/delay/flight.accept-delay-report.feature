Feature: Accept a delay allocation report

  Scenario: As an operations I can accept a pending report
    Given I open a WebSocket connection as "operations"
    When I subscribe to flight events for "7105891a-8008-4b47-b473-c81c97615ad7"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/de1a0000-0000-4000-8000-000000000011/accept"
    Then the response status should be 204
    And I should receive a live flight event of type "flight.delay-report-accepted" within 2000ms
    And I set database to initial state

  Scenario: As an operations I cannot accept an already-accepted report
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/delay/de1a0000-0000-4000-8000-000000000021/accept"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "This delay allocation report has already been accepted and is frozen."
      }
      """

  Scenario: As an operations I cannot accept a report that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/11111111-1111-4111-8111-111111111111/accept"
    Then the response status should be 404

  Scenario: As a cabin crew I cannot accept a report
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/de1a0000-0000-4000-8000-000000000011/accept"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an admin I cannot accept a report
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/de1a0000-0000-4000-8000-000000000011/accept"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot accept a report
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/de1a0000-0000-4000-8000-000000000011/accept"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
