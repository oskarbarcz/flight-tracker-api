Feature: Get a flight diversion

  Scenario: As an admin I cannot get flight diversion
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "message": "Forbidden resource",
        "error": "Forbidden"
      }
      """

  Scenario: As an operations I can get flight diversion
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "severity": "emergency",
        "reason": "med",
        "freeText": null,
        "position": {
          "latitude": 52.520008,
          "longitude": 13.404954
        },
        "notifySecurityOnGround": false,
        "notifyMedicalOnGround": true,
        "notifyFirefightersOnGround": false,
        "decisionTime": "2025-01-01T14:25:00.000Z",
        "estimatedTimeAtDestination": "2025-01-01T15:25:00.000Z",
        "airport": {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "icaoCode": "KJFK",
          "iataCode": "JFK",
          "city": "New York",
          "name": "New York JFK",
          "country": "United States of America",
          "timezone": "America/New_York",
          "continent": "north_america",
          "location": {
            "latitude": 40.6413,
            "longitude": -73.7781
          }
        }
      }
      """

  Scenario: As a cabin crew I can get flight diversion
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "7c1482ce-dc03-4401-8472-0c25eef35de9",
        "severity": "emergency",
        "reason": "med",
        "freeText": null,
        "position": {
          "latitude": 52.520008,
          "longitude": 13.404954
        },
        "notifySecurityOnGround": false,
        "notifyMedicalOnGround": true,
        "notifyFirefightersOnGround": false,
        "decisionTime": "2025-01-01T14:25:00.000Z",
        "estimatedTimeAtDestination": "2025-01-01T15:25:00.000Z",
        "airport": {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "icaoCode": "KJFK",
          "iataCode": "JFK",
          "city": "New York",
          "name": "New York JFK",
          "country": "United States of America",
          "timezone": "America/New_York",
          "location": {
            "latitude": 40.6413,
            "longitude": -73.7781
          },
          "continent": "north_america"
        }
      }
      """

  Scenario: As a cabin crew I cannot get diversion for non-existing flight
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "message": "Diversion was not reported for this flight.",
        "error": "Not Found"
      }
      """

  Scenario: As an unauthorized user I cannot get flight diversion
    When I send a "GET" request to "/api/v1/flight/2eb60569-eb00-424e-ab29-6ba10224495c/diversion"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
