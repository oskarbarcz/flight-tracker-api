Feature: Get flight events

  Scenario: As an admin I can get flight events
    Given I use seed data
    And I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/events"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """
