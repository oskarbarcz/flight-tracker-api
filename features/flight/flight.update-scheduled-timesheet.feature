Feature: Update flight scheduled timesheet

  Scenario: As an admin I cannot update flight scheduled timesheet
    Given I use seed data
    And I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/scheduled" with body:
    """json
    {
      "arrivalTime": "2022-02-02T12:00:00.000Z",
      "onBlockTime": "2022-02-02T12:22:00.000Z",
      "takeoffTime": "2022-02-02T15:25:00.000Z",
      "offBlockTime": "2022-02-02T15:35:00.000Z"
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

  Scenario: As operations I can update flight scheduled timesheet
    Given I use seed data
    And I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/scheduled" with body:
    """json
    {
      "arrivalTime": "2022-02-02T12:00:00.000Z",
      "onBlockTime": "2022-02-02T12:22:00.000Z",
      "takeoffTime": "2022-02-02T15:25:00.000Z",
      "offBlockTime": "2022-02-02T15:35:00.000Z"
    }
    """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88"
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "e91e13a9-09d8-48bf-8453-283cef467b88",
      "flightNumber": "AA 4907",
      "callsign": "AAL 4907",
      "status": "created",
      "timesheet": {
        "scheduled": {
          "arrivalTime": "2022-02-02T12:00:00.000Z",
          "onBlockTime": "2022-02-02T12:22:00.000Z",
          "takeoffTime": "2022-02-02T15:25:00.000Z",
          "offBlockTime": "2022-02-02T15:35:00.000Z"
        }
      },
      "aircraft": {
        "id": "7d27a031-5abb-415f-bde5-1aa563ad394e",
        "icaoCode": "A321",
        "shortName": "A321-251",
        "fullName": "Airbus A331-251 SL ACT-2",
        "registration": "D-AIDA",
        "selcal": "SK-PK",
        "livery": "Sunshine (2024)",
        "operator": {
          "id": "5c649579-22eb-4c07-a96c-b74a77f53871",
          "icaoCode": "CDG",
          "shortName": "Condor",
          "fullName": "Condor Flugdienst",
          "callsign": "CONDOR"
        }
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

  Scenario: As a cabin crew I cannot update flight scheduled timesheet
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/scheduled" with body:
    """json
    {
      "arrivalTime": "2022-02-02T12:00:00.000Z",
      "onBlockTime": "2022-02-02T12:22:00.000Z",
      "takeoffTime": "2022-02-02T15:25:00.000Z",
      "offBlockTime": "2022-02-02T15:35:00.000Z"
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

  Scenario: As operations I cannot update scheduled timesheet of flight with status other than created
    Given I use seed data
    And I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/timesheet/scheduled" with body:
    """json
    {
      "arrivalTime": "2022-02-02T12:00:00.000Z",
      "onBlockTime": "2022-02-02T12:22:00.000Z",
      "takeoffTime": "2022-02-02T15:25:00.000Z",
      "offBlockTime": "2022-02-02T15:35:00.000Z"
    }
    """
    Then the response status should be 422
    And the response body should contain:
    """json
    {
      "statusCode": 422,
      "error": "Unprocessable Content",
      "message": "Cannot change flight schedule, because flight was marked as ready."
    }
    """

  Scenario: As operations I cannot update flight scheduled timesheet with incorrect payload
    Given I use seed data
    And I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/23952e79-6b38-49ed-a1db-bd4d9b3cedab/timesheet/scheduled" with body:
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

  Scenario: As operations I cannot update scheduled timesheet of flight that does not exist
    Given I use seed data
    And I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/732454c3-732e-4e1f-a075-d7fc61296449/timesheet/scheduled" with body:
    """json
    {
      "arrivalTime": "2022-02-02T12:00:00.000Z",
      "onBlockTime": "2022-02-02T12:22:00.000Z",
      "takeoffTime": "2022-02-02T15:25:00.000Z",
      "offBlockTime": "2022-02-02T15:35:00.000Z"
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

  Scenario: As operations I cannot update scheduled timesheet of flight with incorrect uuid
    Given I use seed data
    And I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/incorrect-uuid/timesheet/scheduled" with body:
    """json
    {
      "arrivalTime": "2022-02-02T12:00:00.000Z",
      "onBlockTime": "2022-02-02T12:22:00.000Z",
      "takeoffTime": "2022-02-02T15:25:00.000Z",
      "offBlockTime": "2022-02-02T15:35:00.000Z"
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

  Scenario: As an unauthorized user I cannot report arrival
    When I send a "PATCH" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/timesheet/scheduled" with body:
    """json
    {
      "arrivalTime": "2022-02-02T12:00:00.000Z",
      "onBlockTime": "2022-02-02T12:22:00.000Z",
      "takeoffTime": "2022-02-02T15:25:00.000Z",
      "offBlockTime": "2022-02-02T15:35:00.000Z"
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
