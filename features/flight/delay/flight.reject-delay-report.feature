Feature: Reject a delay allocation report

  Scenario: As an operations I can reject a pending report, sending it back to the crew
    Given I open a WebSocket connection as "operations"
    When I subscribe to flight events for "7105891a-8008-4b47-b473-c81c97615ad7"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/368789fd-0a5c-4e96-9ed2-9c5b2de368d1/reject" with body:
      """json
      {
        "rejectionReason": "Wrong code — this was a ramp delay, not ATC."
      }
      """
    Then the response status should be 204
    And I should receive a live flight event of type "flight.delay-report-rejected" within 2000ms
    And I set database to initial state

  Scenario: As an operations I cannot reject a report that does not exist
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/edbd22fe-860a-403d-ac8d-34657810be5e/reject" with body:
      """json
      {
        "rejectionReason": "Wrong code."
      }
      """
    Then the response status should be 404

  Scenario: As an operations I cannot reject an already-accepted report
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/38644393-deee-434d-bfd1-7242abdbc4e1/delay/4ccb028e-51f5-4d80-9c83-1ab1b3b13c30/reject" with body:
      """json
      {
        "rejectionReason": "Wrong code."
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "This delay allocation report has already been accepted and is frozen."
      }
      """

  Scenario: As a cabin crew I cannot reject a report
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/aa81d28e-c67f-4ba3-9637-77301ea408a1/reject"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an admin I cannot reject a report
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/aa81d28e-c67f-4ba3-9637-77301ea408a1/reject"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot reject a report
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/delay/aa81d28e-c67f-4ba3-9637-77301ea408a1/reject"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
