Feature: Report arrival

  Scenario: As an admin I cannot report arrival
    Given I use seed data
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I cannot report arrival
    Given I use seed data
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As a cabin crew I can report arrival for flight that reported takeoff
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d"
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d",
      "flightNumber": "AA 4912",
      "callsign": "AAL 4912",
      "status": "taxiing_in",
      "timesheet": {
        "scheduled": {
          "arrivalTime": "2025-01-01T16:00:00.000Z",
          "onBlockTime": "2025-01-01T16:18:00.000Z",
          "takeoffTime": "2025-01-01T13:15:00.000Z",
          "offBlockTime": "2025-01-01T13:00:00.000Z"
        },
        "estimated": {
          "arrivalTime": "2025-01-01T15:50:00.000Z",
          "onBlockTime": "2025-01-01T16:08:00.000Z",
          "takeoffTime": "2025-01-01T13:15:00.000Z",
          "offBlockTime": "2025-01-01T13:00:00.000Z"
        },
        "actual": {
          "arrivalTime": "@date('within 1 minute from now')",
          "onBlockTime": null,
          "takeoffTime": "2025-01-01T13:25:00.000Z",
          "offBlockTime": "2025-01-01T13:10:00.000Z"
        }
      },
      "aircraft": {
        "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "icaoCode": "B773",
        "shortName": "Boeing 777",
        "fullName": "Boeing 777-300ER",
        "registration": "N78881",
        "selcal": "KY-JO",
        "livery": "Team USA (2023)",
        "operator": {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN"
        }
      },
      "operator": {
        "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "icaoCode": "AAL",
        "shortName": "American Airlines",
        "fullName": "American Airlines, Inc.",
        "callsign": "AMERICAN"
      },
      "airports": [
        {
          "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
          "icaoCode": "KBOS",
          "iataCode": "BOS",
          "city": "Boston",
          "name": "Boston Logan Intl",
          "country": "United States of America",
          "timezone": "America/New_York",
          "type": "departure"
        },
        {
          "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
          "icaoCode": "KPHL",
          "iataCode": "PHL",
          "city": "Philadelphia",
          "name": "Philadelphia Intl",
          "country": "United States of America",
          "timezone": "America/New_York",
          "type": "destination"
        },
        {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "icaoCode": "KJFK",
          "iataCode": "JFK",
          "city": "New York",
          "name": "New York JFK",
          "country": "United States of America",
          "timezone": "America/New_York",
          "type": "destination_alternate"
        }
      ]
    }
    """

  Scenario: As a cabin crew I cannot report arrival for flight twice
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "message": "Cannot report arrival for flight that is not in cruise.",
      "error": "Unprocessable Content",
      "statusCode": 422
    }
    """

  Scenario: As a cabin crew I cannot report arrival for flight that not reported takeoff
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/report-arrival"
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "message": "Cannot report arrival for flight that is not in cruise.",
      "error": "Unprocessable Content",
      "statusCode": 422
    }
    """

  Scenario: As a cabin crew I cannot report arrival for flight that does not exist
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0ee4dec-b1fd-44aa-822c-28a7ead0191a/report-arrival"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Flight with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: As a cabin crew I cannot report arrival for flight with incorrect uuid
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/invalid-uuid/report-arrival"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """

  Scenario: As an unauthorized user I cannot report arrival
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/report-arrival"
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """
