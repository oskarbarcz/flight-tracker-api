Feature: Report a flight diversion

  Scenario: As an admin I cannot report flight diversion
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "message": "Forbidden resource",
        "error": "Forbidden"
      }
      """

  Scenario: As an operations I can report flight diversion
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 204
    And I set database to initial state

  Scenario: As a cabin crew I can report flight diversion
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 204
    And I set database to initial state

  Scenario: As a cabin crew I cannot report flight diversion when flight has incorrect status
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/e8e17e59-67d7-4a6c-a0bd-425ffa6bed66/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Diversion can be reported to flights in Taxiing Out or In Cruise status only",
        "error": "Bad Request"
      }
      """

  Scenario: As a cabin crew I cannot divert already diverted flight
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/1e9f4176-188f-41a5-a9d1-25a96579f46d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "message": "Active diversion already exists for this flight",
        "error": "Conflict"
      }
      """

  Scenario: As a cabin crew I cannot report diversion for non-existing flight
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/2eb60569-eb00-424e-ab29-6ba10224495c/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "message": "Flight was not found",
        "error": "Not Found"
      }
      """

  Scenario: As an unauthorized user I cannot report flight diversion
    When I send a "POST" request to "/api/v1/flight/2d1c92f6-8ed1-4921-9a70-f71b1ed2e72d/diversion" with body:
      """json
      {
        "severity": "emergency",
        "reason": "wx",
        "freeText": "Severe weather at destination airport",
        "position": {
          "longitude": 8.570556,
          "latitude": 50.033333
        },
        "notifySecurityOnGround": true,
        "notifyMedicalOnGround": false,
        "notifyFirefightersOnGround": true,
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "estimatedTimeAtDestination": "2025-01-01T16:00:00Z"
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
