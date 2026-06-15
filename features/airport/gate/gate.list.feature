Feature: List gates at an airport

  Scenario: As an admin I can list gates at an airport
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
          "coordinates": "@coordinates"
        },
        {
          "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "A11",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "parkingPositionType": "angled",
          "parkingSpotType": "passenger",
          "parkingAssistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "yes",
          "noiseSensitivityText": "Night curfew: no engine runs or pushbacks permitted.",
          "noiseSensitivityStartTime": "21:00",
          "noiseSensitivityEndTime": "05:00",
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2201",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "name": "B5",
          "bridge": "yes",
          "stairs": "no",
          "deicing": "mandatory",
          "deicingDescription": "Deicing pad shared with stand B6. Coordinate with ground ops.",
          "gpu": "both",
          "pca": "both",
          "parkingPositionType": "straight-in-taxi-through",
          "parkingSpotType": "passenger",
          "parkingAssistance": "vdgs-or-marshaller",
          "location": "gate",
          "noiseSensitivity": "no",
          "noiseSensitivityText": null,
          "noiseSensitivityStartTime": null,
          "noiseSensitivityEndTime": null,
          "fuelingOptions": "hydrant",
          "coordinates": "@coordinates"
        }
      ]
      """

  Scenario: As operations I can list gates
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
          "coordinates": "@coordinates"
        },
        {
          "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "A11",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "parkingPositionType": "angled",
          "parkingSpotType": "passenger",
          "parkingAssistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "yes",
          "noiseSensitivityText": "Night curfew: no engine runs or pushbacks permitted.",
          "noiseSensitivityStartTime": "21:00",
          "noiseSensitivityEndTime": "05:00",
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2201",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "name": "B5",
          "bridge": "yes",
          "stairs": "no",
          "deicing": "mandatory",
          "deicingDescription": "Deicing pad shared with stand B6. Coordinate with ground ops.",
          "gpu": "both",
          "pca": "both",
          "parkingPositionType": "straight-in-taxi-through",
          "parkingSpotType": "passenger",
          "parkingAssistance": "vdgs-or-marshaller",
          "location": "gate",
          "noiseSensitivity": "no",
          "noiseSensitivityText": null,
          "noiseSensitivityStartTime": null,
          "noiseSensitivityEndTime": null,
          "fuelingOptions": "hydrant",
          "coordinates": "@coordinates"
        }
      ]
      """

  Scenario: As a cabin crew I can list gates
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
          "coordinates": "@coordinates"
        },
        {
          "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "A11",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "parkingPositionType": "angled",
          "parkingSpotType": "passenger",
          "parkingAssistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "yes",
          "noiseSensitivityText": "Night curfew: no engine runs or pushbacks permitted.",
          "noiseSensitivityStartTime": "21:00",
          "noiseSensitivityEndTime": "05:00",
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2201",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "name": "B5",
          "bridge": "yes",
          "stairs": "no",
          "deicing": "mandatory",
          "deicingDescription": "Deicing pad shared with stand B6. Coordinate with ground ops.",
          "gpu": "both",
          "pca": "both",
          "parkingPositionType": "straight-in-taxi-through",
          "parkingSpotType": "passenger",
          "parkingAssistance": "vdgs-or-marshaller",
          "location": "gate",
          "noiseSensitivity": "no",
          "noiseSensitivityText": null,
          "noiseSensitivityStartTime": null,
          "noiseSensitivityEndTime": null,
          "fuelingOptions": "hydrant",
          "coordinates": "@coordinates"
        }
      ]
      """

  Scenario: As a cabin crew I cannot list gates of non-existing airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/gate"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I can list gates
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/gate"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
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
          "coordinates": "@coordinates"
        },
        {
          "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2102",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "A11",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "parkingPositionType": "angled",
          "parkingSpotType": "passenger",
          "parkingAssistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "yes",
          "noiseSensitivityText": "Night curfew: no engine runs or pushbacks permitted.",
          "noiseSensitivityStartTime": "21:00",
          "noiseSensitivityEndTime": "05:00",
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2201",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "name": "B5",
          "bridge": "yes",
          "stairs": "no",
          "deicing": "mandatory",
          "deicingDescription": "Deicing pad shared with stand B6. Coordinate with ground ops.",
          "gpu": "both",
          "pca": "both",
          "parkingPositionType": "straight-in-taxi-through",
          "parkingSpotType": "passenger",
          "parkingAssistance": "vdgs-or-marshaller",
          "location": "gate",
          "noiseSensitivity": "no",
          "noiseSensitivityText": null,
          "noiseSensitivityStartTime": null,
          "noiseSensitivityEndTime": null,
          "fuelingOptions": "hydrant",
          "coordinates": "@coordinates"
        }
      ]
      """
