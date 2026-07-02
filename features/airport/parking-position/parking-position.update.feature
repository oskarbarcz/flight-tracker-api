Feature: Update parking position

  Scenario: As an admin I cannot update parking position
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9" with body:
      """json
      { "deicing": "mandatory" }
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

  Scenario: As operations I can update parking position with deicing description and noise curfew
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9" with body:
      """json
      {
        "name": "445R",
        "deicing": "mandatory",
        "deicingDescription": "Central deicing pad; expect delays in winter.",
        "noiseSensitivity": "yes",
        "noiseSensitivityText": "Night curfew.",
        "noiseSensitivityStartTime": "23:00",
        "noiseSensitivityEndTime": "04:30"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "445R",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "mandatory",
        "deicingDescription": "Central deicing pad; expect delays in winter.",
        "gpu": "bridge",
        "pca": "bridge",
        "type": "straight-in",
        "spotType": "passenger",
        "assistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "yes",
        "noiseSensitivityText": "Night curfew.",
        "noiseSensitivityStartTime": "23:00",
        "noiseSensitivityEndTime": "04:30",
        "fuelingOptions": "hydrant",
        "coordinates": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: As operations I can reassign parking position to another terminal
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9" with body:
      """json
      { "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f" }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
        "name": "B 42",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "deicingDescription": null,
        "gpu": "bridge",
        "pca": "bridge",
        "type": "straight-in",
        "spotType": "passenger",
        "assistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "noiseSensitivityText": null,
        "noiseSensitivityStartTime": null,
        "noiseSensitivityEndTime": null,
        "fuelingOptions": "hydrant",
        "coordinates": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot reassign parking position to a terminal that does not belong to airport
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9" with body:
      """json
      { "terminalId": "104014ec-110e-483d-9f3c-8f6909fe4823" }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Terminal with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot update parking position
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9" with body:
      """json
      { "deicing": "mandatory" }
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

  Scenario: As operations I cannot update parking position that does not belong to airport
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9" with body:
      """json
      { "deicing": "mandatory" }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Parking position with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot update parking position with invalid data
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9" with body:
      """json
      { "deicing": "perhaps" }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "deicing": ["deicing must be one of the following values: no, possible, recommended, mandatory"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot update parking position
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position/ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9" with body:
      """json
      { "deicing": "mandatory" }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
