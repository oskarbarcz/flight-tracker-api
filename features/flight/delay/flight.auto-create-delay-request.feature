Feature: Auto-create a delay allocation request on a late off-block

  Scenario: A late off-block report auto-creates a pending delay request
    Given I open a WebSocket connection as "cabin crew"
    When I subscribe to flight events for "f14a2141-4737-4622-a387-40513ff3baf1"
    Then I should receive flight event history within 2000ms
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/report-off-block"
    Then the response status should be 204
    And I should receive a live flight event of type "flight.delay-request-created" within 2000ms
    When I send a "GET" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/delay"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "flightId": "f14a2141-4737-4622-a387-40513ff3baf1",
        "totalDelayMinutes": "@any",
        "allocatedMinutes": 0,
        "isReconciled": false,
        "isSettled": false,
        "reports": [],
        "createdAt": "@date('within 1 minute from now')"
      }
      """
    And I set database to initial state

  Scenario: A flight that has not departed has no delay request
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/delay"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "This flight has no delay request."
      }
      """
