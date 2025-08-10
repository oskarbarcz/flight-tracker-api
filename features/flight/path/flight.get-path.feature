Feature: Get flight path

  Scenario: As an admin I can get flight path that is on block
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/17d2f703-957d-4ad1-a620-3c187a70c26a/path"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T13:10:00.000Z",
          "latitude": 60.31725520857805,
          "longitude": 24.95894583717233
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T13:40:00.000Z",
          "latitude": 58.68825909518984,
          "longitude": 22.2484601742369
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T14:10:00.000Z",
          "latitude": 55.5874754425049,
          "longitude": 17.20492186276411
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T14:40:00.000Z",
          "latitude": 54.37998045994538,
          "longitude": 18.46850453127673
        }
      ]
      """

  Scenario: As operations I can get flight path that is on block
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/17d2f703-957d-4ad1-a620-3c187a70c26a/path"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T13:10:00.000Z",
          "latitude": 60.31725520857805,
          "longitude": 24.95894583717233
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T13:40:00.000Z",
          "latitude": 58.68825909518984,
          "longitude": 22.2484601742369
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T14:10:00.000Z",
          "latitude": 55.5874754425049,
          "longitude": 17.20492186276411
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T14:40:00.000Z",
          "latitude": 54.37998045994538,
          "longitude": 18.46850453127673
        }
      ]
      """

  Scenario: As cabin crew I can get flight path that is on block
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/17d2f703-957d-4ad1-a620-3c187a70c26a/path"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T13:10:00.000Z",
          "latitude": 60.31725520857805,
          "longitude": 24.95894583717233
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T13:40:00.000Z",
          "latitude": 58.68825909518984,
          "longitude": 22.2484601742369
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T14:10:00.000Z",
          "latitude": 55.5874754425049,
          "longitude": 17.20492186276411
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T14:40:00.000Z",
          "latitude": 54.37998045994538,
          "longitude": 18.46850453127673
        }
      ]
      """

  Scenario: As an unauthorized user I can get flight path that is on block
    When I send a "GET" request to "/api/v1/flight/17d2f703-957d-4ad1-a620-3c187a70c26a/path"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T13:10:00.000Z",
          "latitude": 60.31725520857805,
          "longitude": 24.95894583717233
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T13:40:00.000Z",
          "latitude": 58.68825909518984,
          "longitude": 22.2484601742369
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T14:10:00.000Z",
          "latitude": 55.5874754425049,
          "longitude": 17.20492186276411
        },
        {
          "callsign": "AAL4914",
          "date": "2025-01-01T14:40:00.000Z",
          "latitude": 54.37998045994538,
          "longitude": 18.46850453127673
        }
      ]
      """

  Scenario: As cabin crew I can get flight path of flight that has no path yet
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/path"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As a cabin crew I cannot get flight path for invalid flight id
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/invalid-flight-id/path"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As a cabin crew I cannot get flight path for non-existing flight
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/11b8dbbf-9e9e-4ea4-a36a-975ab117fc87/path"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """
