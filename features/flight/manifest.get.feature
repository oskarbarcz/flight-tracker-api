Feature: Read the seated passenger manifest of a flight

  Scenario: As operations I seat a flight's passengers by releasing it
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "a5fffa17-7803-4e85-8291-d1dc9276bd46",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 24, "economy": 126 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And every entry of the response body list "passengers" should have a "name"
    And every entry of the response body list "passengers" should have a "pnr"
    And every entry of the response body list "passengers" should have a "cabin"
    And I set database to initial state

  Scenario: As operations I release a full flight and every seat is taken
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/c9c526f4-7b97-4454-b1e4-28b5ea57851f/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/c9c526f4-7b97-4454-b1e4-28b5ea57851f/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "c9c526f4-7b97-4454-b1e4-28b5ea57851f",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 220,
        "passengersByCabin": { "business": 36, "economy": 184 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And I set database to initial state

  Scenario: As operations I seat a flight by the cabin breakdown I planned
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/8e5f9f40-34f3-4813-99db-b732ba2b815e/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/8e5f9f40-34f3-4813-99db-b732ba2b815e/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "8e5f9f40-34f3-4813-99db-b732ba2b815e",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 30, "economy": 120 },
        "passengers": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I seat a flight against a cabin AeroLOPA has withdrawn
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/c51c6b82-c74a-4f8f-9d6b-f768124446c5/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/c51c6b82-c74a-4f8f-9d6b-f768124446c5/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "c51c6b82-c74a-4f8f-9d6b-f768124446c5",
        "cabinLayout": "fi-752-1",
        "cabinLayoutRevision": 1,
        "passengerCount": 100,
        "passengersByCabin": { "business": 12, "economy": 88 },
        "passengers": "@any"
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot release more passengers than the cabin seats
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/56999cc9-b26d-4f3b-a51e-2b175809b0cd/mark-as-ready"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot seat 221 passengers in a cabin of 220 seats."
      }
      """
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/56999cc9-b26d-4f3b-a51e-2b175809b0cd/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-02T17:35:00.000Z",
        "onBlockTime": "2025-01-02T17:45:00.000Z",
        "takeoffTime": "2025-01-02T09:25:00.000Z",
        "offBlockTime": "2025-01-02T09:05:00.000Z"
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot check in for flight, because flight is not ready."
      }
      """
    And I set database to initial state

  Scenario: As operations I release a flight whose aircraft has no cabin layout
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/e91e13a9-09d8-48bf-8453-283cef467b88/manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Aircraft flying this flight has no cabin layout assigned, so the flight has no manifest."
      }
      """
    And I set database to initial state

  Scenario: As operations I read the manifest of a flight already under way
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "a7cd765c-8dcf-40b6-99a5-dae4a5c974b6",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 24, "economy": 126 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values

  Scenario: As the captain I read the manifest of the flight I command
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "a7cd765c-8dcf-40b6-99a5-dae4a5c974b6",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 24, "economy": 126 },
        "passengers": "@any"
      }
      """

  Scenario: As a cabin crew I cannot read the manifest of a flight I do not command
    Given I am signed in as "Alan Doe"
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "error": "Forbidden",
        "message": "Cabin crew can only read the manifest of a flight they captain."
      }
      """

  Scenario: As operations I read no manifest for a flight that has not been released
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight has no manifest yet. It is generated when the flight is released to the pilot."
      }
      """

  Scenario: As operations I cannot read the manifest of a flight that does not exist
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/db9b8707-c1a9-479a-9923-7caae3e8ea78/manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight with given id does not exist."
      }
      """

  Scenario: As an admin I cannot read a flight manifest
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot read a flight manifest
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest" with bearer token "invalid"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
