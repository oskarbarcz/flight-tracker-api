Feature: Check in pilot for flight

  Scenario: As an admin I cannot check in pilot for flight
    Given I use seed data
    And I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
    """json
    {
      "arrivalTime": "2024-01-01T15:50:00.000Z",
      "onBlockTime": "2024-01-01T16:08:00.000Z",
      "takeoffTime": "2024-01-01T13:15:00.000Z",
      "offBlockTime": "2024-01-01T13:00:00.000Z"
    }
    """
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As operations I cannot check in pilot for flight
    Given I use seed data
    And I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
    """json
    {
      "arrivalTime": "2024-01-01T15:50:00.000Z",
      "onBlockTime": "2024-01-01T16:08:00.000Z",
      "takeoffTime": "2024-01-01T13:15:00.000Z",
      "offBlockTime": "2024-01-01T13:00:00.000Z"
    }
    """
    Then the response status should be 403
    And the response body should contain:
    """json
    {
      "message": "Forbidden resource",
      "error": "Forbidden",
      "statusCode": 403
    }
    """

  Scenario: As a cabin crew I can check in pilot for flight
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
    """json
    {
      "arrivalTime": "2024-01-01T15:50:00.000Z",
      "onBlockTime": "2024-01-01T16:08:00.000Z",
      "takeoffTime": "2024-01-01T13:15:00.000Z",
      "offBlockTime": "2024-01-01T13:00:00.000Z"
    }
    """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab"
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "23952e79-6b38-49ed-a1db-bd4d9b3cedab",
      "flightNumber": "AA 4906",
      "callsign": "AAL 4906",
      "status": "checked_in",
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

  Scenario: As a cabin crew I cannot check in pilot for flight twice
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
    """json
    {
      "arrivalTime": "2024-01-01T15:50:00.000Z",
      "onBlockTime": "2024-01-01T16:08:00.000Z",
      "takeoffTime": "2024-01-01T13:15:00.000Z",
      "offBlockTime": "2024-01-01T13:00:00.000Z"
    }
    """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
    """json
    {
      "arrivalTime": "2024-01-01T15:50:00.000Z",
      "onBlockTime": "2024-01-01T16:08:00.000Z",
      "takeoffTime": "2024-01-01T13:15:00.000Z",
      "offBlockTime": "2024-01-01T13:00:00.000Z"
    }
    """
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "message": "Cannot check in for flight, because flight is not ready.",
      "error": "Unprocessable Content",
      "statusCode": 422
    }
    """

    Scenario: As a cabin crew I cannot check in pilot when flight is not ready
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/check-in" with body:
    """json
    {
      "arrivalTime": "2024-01-01T15:50:00.000Z",
      "onBlockTime": "2024-01-01T16:08:00.000Z",
      "takeoffTime": "2024-01-01T13:15:00.000Z",
      "offBlockTime": "2024-01-01T13:00:00.000Z"
    }
    """
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "message": "Cannot check in for flight, because flight is not ready.",
      "error": "Unprocessable Content",
      "statusCode": 422
    }
    """

  Scenario: As a cabin crew I cannot check in pilot for flight with incorrect schedule payload
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05/check-in" with body:
    """json
    {
      "arrivalTime": "2022-02-02T12:00:00.000Z",
      "offBlockTime": "some-non-existing-date",
      "testTime": "2022-02-02T15:35:00.000Z"
    }
    """
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Request validation failed.",
      "error": "Bad Request",
      "statusCode": 400,
      "violations": {
        "onBlockTime": [
          "onBlockTime must be a Date instance",
          "onBlockTime should not be empty"
        ],
        "takeoffTime": [
          "takeoffTime must be a Date instance",
          "takeoffTime should not be empty"
        ],
        "offBlockTime": [
          "offBlockTime must be a Date instance"
        ],
        "testTime": [
          "property testTime should not exist"
        ]
      }
    }
    """

  Scenario: As a cabin crew I cannot check in pilot for flight that does not exist
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/141a2f56-708d-4cc9-b967-64dc0c2b20c4/check-in" with body:
    """json
    {
      "arrivalTime": "2024-01-01T15:50:00.000Z",
      "onBlockTime": "2024-01-01T16:08:00.000Z",
      "takeoffTime": "2024-01-01T13:15:00.000Z",
      "offBlockTime": "2024-01-01T13:00:00.000Z"
    }
    """
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Flight with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: As a cabin crew I cannot check in pilot for flight with incorrect uuid
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/incorrect-uuid/check-in" with body:
    """json
    {
      "arrivalTime": "2024-01-01T15:50:00.000Z",
      "onBlockTime": "2024-01-01T16:08:00.000Z",
      "takeoffTime": "2024-01-01T13:15:00.000Z",
      "offBlockTime": "2024-01-01T13:00:00.000Z"
    }
    """
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """

  Scenario: As an unauthorized user I cannot check in pilot for flight
    When I send a "POST" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/check-in" with body:
    """json
    {
      "arrivalTime": "2024-01-01T15:50:00.000Z",
      "onBlockTime": "2024-01-01T16:08:00.000Z",
      "takeoffTime": "2024-01-01T13:15:00.000Z",
      "offBlockTime": "2024-01-01T13:00:00.000Z"
    }
    """
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """