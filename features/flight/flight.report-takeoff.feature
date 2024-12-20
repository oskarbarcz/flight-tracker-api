Feature: Report takeoff for flight that reported off-block
  Scenario: Report takeoff for flight that reported off-block
    Given I use seed data
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/report-takeoff"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7"
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "7105891a-8008-4b47-b473-c81c97615ad7",
      "flightNumber": "AA 4911",
      "callsign": "AAL 4911",
      "status": "in_cruise",
      "timesheet": {
        "scheduled": {
          "arrivalTime": "2024-01-01T16:00:00.000Z",
          "onBlockTime": "2024-01-01T16:18:00.000Z",
          "takeoffTime": "2024-01-01T13:15:00.000Z",
          "offBlockTime": "2024-01-01T13:00:00.000Z"
        },
        "estimated": {
          "arrivalTime": "2024-01-01T15:50:00.000Z",
          "onBlockTime": "2024-01-01T16:08:00.000Z",
          "takeoffTime": "2024-01-01T13:15:00.000Z",
          "offBlockTime": "2024-01-01T13:00:00.000Z"
        },
        "actual": {
          "arrivalTime": null,
          "onBlockTime": null,
          "takeoffTime": "@date('within 1 minute from now')",
          "offBlockTime": "2024-01-01T13:10:00.000Z"
        }
      },
      "aircraft": {
        "id": "7d27a031-5abb-415f-bde5-1aa563ad394e",
        "icaoCode": "A321",
        "shortName": "A321-251",
        "fullName": "Airbus A331-251 SL ACT-2",
        "registration": "D-AIDA",
        "selcal": "SK-PK",
        "livery": "Sunshine (2024)"
      },
      "airports": [
        {
          "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
          "icaoCode": "KBOS",
          "name": "Boston Logan Intl",
          "country": "United States of America",
          "timezone": "GMT-5",
          "type": "departure"
        },
        {
          "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
          "icaoCode": "KPHL",
          "name": "Philadelphia Intl",
          "country": "United States of America",
          "timezone": "GMT-5",
          "type": "destination"
        },
        {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "icaoCode": "KJFK",
          "name": "New York JFK",
          "country": "United States of America",
          "timezone": "America/New_York",
          "type": "destination_alternate"
        }
      ]
    }
    """

  Scenario: Report takeoff for flight twice
    Given I use seed data
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/report-takeoff"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/7105891a-8008-4b47-b473-c81c97615ad7/report-takeoff"
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "message": "Cannot report takeoff for flight that is not taxiing out.",
      "error": "Unprocessable Content",
      "statusCode": 422
    }
    """

    Scenario: Report takeoff for flight that not reported off-block
    Given I use seed data
    When I send a "POST" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/report-takeoff"
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "message": "Cannot report takeoff for flight that is not taxiing out.",
      "error": "Unprocessable Content",
      "statusCode": 422
    }
    """

  Scenario: Report takeoff for flight that does not exist
    Given I use seed data
    When I send a "POST" request to "/api/v1/flight/c0ee4dec-b1fd-44aa-822c-28a7ead0191a/report-takeoff"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Flight with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Report takeoff for flight with incorrect uuid
    When I send a "POST" request to "/api/v1/flight/invalid-uuid/report-takeoff"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """