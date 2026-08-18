Feature: Verify a Simbrief user ID

  Scenario: As a cabin crew I can verify a Simbrief user ID and see its most recent flight
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/simbrief/987654"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "simbriefUserId": "987654",
        "latestFlight": {
          "callsign": "DLH0400",
          "origin": {
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "name": "FRANKFURT INTL"
          },
          "destination": {
            "icaoCode": "EPWA",
            "iataCode": "WAW",
            "name": "WARSAW CHOPIN"
          },
          "aircraft": {
            "registration": "D-AIRC",
            "type": "A320",
            "name": "A320-200"
          },
          "scheduledOffBlockTime": "2026-08-16T14:47:00.000Z",
          "scheduledOnBlockTime": "2026-08-16T16:47:00.000Z",
          "generatedAt": "2026-08-16T15:01:57.000Z"
        }
      }
      """

  Scenario: As an admin I can verify a Simbrief user ID
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/simbrief/987654"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "simbriefUserId": "987654",
        "latestFlight": {
          "callsign": "DLH0400",
          "origin": {
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "name": "FRANKFURT INTL"
          },
          "destination": {
            "icaoCode": "EPWA",
            "iataCode": "WAW",
            "name": "WARSAW CHOPIN"
          },
          "aircraft": {
            "registration": "D-AIRC",
            "type": "A320",
            "name": "A320-200"
          },
          "scheduledOffBlockTime": "2026-08-16T14:47:00.000Z",
          "scheduledOnBlockTime": "2026-08-16T16:47:00.000Z",
          "generatedAt": "2026-08-16T15:01:57.000Z"
        }
      }
      """

  Scenario: As a cabin crew I am told when Simbrief does not know the user ID
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/simbrief/999999"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "SimBrief account with given ID does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I cannot verify a Simbrief user ID
    When I send a "GET" request to "/api/v1/user/simbrief/987654"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
