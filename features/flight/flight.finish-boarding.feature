Feature: Finish flight boarding

  Scenario: As an admin I can finish boarding in flight that is checked in
    Given I use seed data
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I can finish boarding in flight that is checked in
    Given I use seed data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding"
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As a cabin crew I can finish boarding in flight that is checked in
    Given I use seed data
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77"
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "05986dd3-ff01-4112-ad35-ecd85db05c77",
      "flightNumber": "AA 4909",
      "callsign": "AAL 4909",
      "status": "boarding_finished",
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

  Scenario: As a cabin crew I cannot finish boarding in flight twice
    Given I use seed data
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding"
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding"
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "message": "Cannot finish boarding for flight, because flight has not started boarding.",
      "error": "Unprocessable Content",
      "statusCode": 422
    }
    """

    Scenario: As a cabin crew I cannot finish boarding when flight has not started boarding yet
    Given I use seed data
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/b3899775-278e-4496-add1-21385a13d93e/finish-boarding"
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "message": "Cannot finish boarding for flight, because flight has not started boarding.",
      "error": "Unprocessable Content",
      "statusCode": 422
    }
    """

  Scenario: As a cabin crew I cannot finish boarding in flight that does not exist
    Given I use seed data
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0ee4dec-b1fd-44aa-822c-28a7ead0191a/finish-boarding"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Flight with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: As a cabin crew I cannot finish boarding in flight with incorrect uuid
    Given I use seed data
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/invalid-uuid/finish-boarding"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """

  Scenario: As an unauthorized user I cannot finish boarding in flight
    When I send a "POST" request to "/api/v1/flight/05986dd3-ff01-4112-ad35-ecd85db05c77/finish-boarding"
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """