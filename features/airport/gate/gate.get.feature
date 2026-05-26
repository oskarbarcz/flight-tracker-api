Feature: Get gate

  Scenario: As an admin I can get one gate
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A10",
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
        "fuelingOptions": "hydrant",
        "coordinates": "@any"
      }
      """

  Scenario: As operations I can get one gate
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A10",
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
        "fuelingOptions": "hydrant",
        "coordinates": "@any"
      }
      """

  Scenario: As a cabin crew I can get one gate
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A10",
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
        "fuelingOptions": "hydrant",
        "coordinates": "@any"
      }
      """

  Scenario: As a cabin crew I cannot get gate that does not belong to airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Gate with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot get gate of non-existing airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot get gate with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I can get one gate
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate/4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
        "name": "A10",
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
        "fuelingOptions": "hydrant",
        "coordinates": "@any"
      }
      """
