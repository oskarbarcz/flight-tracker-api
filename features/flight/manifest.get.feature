Feature: Read the seated passenger manifest of a flight

  Scenario: As operations I seat a flight's passengers by releasing it
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 4
        },
        "passengers": 150,
        "payload": 19.3,
        "cargo": 1.9,
        "zeroFuelWeight": 60.7,
        "blockFuel": 11.9
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "c0e83544-cefd-41c8-9c60-aadfaaf08590",
        "cabinLayout": "kl-738",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": {
          "business": 24,
          "economy": 126
        },
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
    When I send a "PATCH" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 4
        },
        "passengers": 186,
        "payload": 19.3,
        "cargo": 1.9,
        "zeroFuelWeight": 60.7,
        "blockFuel": 11.9
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/mark-as-ready"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "c0e83544-cefd-41c8-9c60-aadfaaf08590",
        "cabinLayout": "kl-738",
        "cabinLayoutRevision": 1,
        "passengerCount": 186,
        "passengersByCabin": {
          "business": 30,
          "economy": 156
        },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And I set database to initial state

  Scenario: As operations I seat a flight against a layout AeroLOPA has withdrawn
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/c51c6b82-c74a-4f8f-9d6b-f768124446c5/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 4
        },
        "passengers": 100,
        "payload": 14.2,
        "cargo": 1.4,
        "zeroFuelWeight": 72.4,
        "blockFuel": 14.8
      }
      """
    Then the response status should be 204
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
        "passengersByCabin": {
          "business": 12,
          "economy": 88
        },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And I set database to initial state

  Scenario: As operations I cannot release more passengers than the cabin seats
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 4
        },
        "passengers": 187,
        "payload": 19.3,
        "cargo": 1.9,
        "zeroFuelWeight": 60.7,
        "blockFuel": 11.9
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/mark-as-ready"
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot seat 187 passengers in a cabin of 186 seats."
      }
      """
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
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

  Scenario: As operations I read no manifest for a flight that has not been released
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/manifest"
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

  Scenario: As the captain I read the manifest of the flight I command
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 4
        },
        "passengers": 150,
        "payload": 19.3,
        "cargo": 1.9,
        "zeroFuelWeight": 60.7,
        "blockFuel": 11.9
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/mark-as-ready"
    Then the response status should be 204
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/check-in" with body:
      """json
      {
        "arrivalTime": "2025-01-01T15:50:00.000Z",
        "onBlockTime": "2025-01-01T16:08:00.000Z",
        "takeoffTime": "2025-01-01T13:15:00.000Z",
        "offBlockTime": "2025-01-01T13:00:00.000Z"
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "c0e83544-cefd-41c8-9c60-aadfaaf08590",
        "cabinLayout": "kl-738",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": {
          "business": 24,
          "economy": 126
        },
        "passengers": "@any"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot read the manifest of a flight I do not command
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/loadsheet/preliminary" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 4
        },
        "passengers": 150,
        "payload": 19.3,
        "cargo": 1.9,
        "zeroFuelWeight": 60.7,
        "blockFuel": 11.9
      }
      """
    Then the response status should be 204
    When I send a "POST" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/mark-as-ready"
    Then the response status should be 204
    Given I am signed in as "Alan Doe"
    When I send a "GET" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/manifest"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "error": "Forbidden",
        "message": "Cabin crew can only read the manifest of a flight they captain."
      }
      """
    And I set database to initial state

  Scenario: As an admin I cannot read a flight manifest
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/manifest"
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
    When I send a "GET" request to "/api/v1/flight/c0e83544-cefd-41c8-9c60-aadfaaf08590/manifest" with bearer token "invalid"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
