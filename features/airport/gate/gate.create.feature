Feature: Create gate

  Scenario: As an admin I cannot create gate
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "fuelingOptions": "hydrant"
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

  Scenario: As operations I can create gate
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "fuelingOptions": "hydrant"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "deicingDescription": null,
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "noiseSensitivityText": null,
        "noiseSensitivityStartTime": null,
        "noiseSensitivityEndTime": null,
        "fuelingOptions": "hydrant"
      }
      """
    And I set database to initial state

  Scenario: As operations I can create gate with deicing description and noise curfew
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A21",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "mandatory",
        "deicingDescription": "De-ice on stand only. Holdover time limit 12 min.",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "yes",
        "noiseSensitivityText": "Curfew window, no ops permitted.",
        "noiseSensitivityStartTime": "22:30",
        "noiseSensitivityEndTime": "04:45",
        "fuelingOptions": "hydrant"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A21",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "mandatory",
        "deicingDescription": "De-ice on stand only. Holdover time limit 12 min.",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "yes",
        "noiseSensitivityText": "Curfew window, no ops permitted.",
        "noiseSensitivityStartTime": "22:30",
        "noiseSensitivityEndTime": "04:45",
        "fuelingOptions": "hydrant"
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot create gate with malformed noise window time
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A22",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "yes",
        "noiseSensitivityStartTime": "25:99",
        "fuelingOptions": "hydrant"
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
          "noiseSensitivityStartTime": [
            "noiseSensitivityStartTime must be a valid representation of military time in the format HH:MM"
          ]
        }
      }
      """

  Scenario: As a cabin crew I cannot create gate
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "fuelingOptions": "hydrant"
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

  Scenario: As operations I cannot create gate at non-existing airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "fuelingOptions": "hydrant"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot create gate when terminal does not belong to airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "fuelingOptions": "hydrant"
      }
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

  Scenario: As operations I cannot create gate with incorrect data
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "bridge": "maybe",
        "stairs": "no",
        "deicing": "possible",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "fuelingOptions": "hydrant"
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
          "bridge": ["bridge must be one of the following values: yes, no"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot create gate
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate" with body:
      """json
      {
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A20",
        "bridge": "yes",
        "stairs": "no",
        "deicing": "possible",
        "gpu": "bridge",
        "pca": "bridge",
        "parkingPositionType": "straight-in",
        "parkingSpotType": "passenger",
        "parkingAssistance": "vdgs",
        "location": "gate",
        "noiseSensitivity": "no",
        "fuelingOptions": "hydrant"
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
