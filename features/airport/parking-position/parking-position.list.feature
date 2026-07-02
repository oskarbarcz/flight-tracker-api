Feature: List parking positions at an airport

  Scenario: As an admin I can list parking positions at an airport
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "77646d11-415c-4090-bc2b-e85cd1814b64",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "445",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "type": "angled",
          "spotType": "passenger",
          "assistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "no",
          "noiseSensitivityText": null,
          "noiseSensitivityStartTime": null,
          "noiseSensitivityEndTime": null,
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "ae098e8f-b088-41a6-a566-880c7dd5e931",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "A11",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "type": "angled",
          "spotType": "passenger",
          "assistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "yes",
          "noiseSensitivityText": "Night curfew: no engine runs or pushbacks permitted.",
          "noiseSensitivityStartTime": "21:00",
          "noiseSensitivityEndTime": "05:00",
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
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
        },
        {
          "id": "df5a931d-3b2e-4767-bdd4-1c14689e0e13",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "name": "N4",
          "bridge": "yes",
          "stairs": "no",
          "deicing": "mandatory",
          "deicingDescription": "Deicing pad shared with stand B6. Coordinate with ground ops.",
          "gpu": "both",
          "pca": "both",
          "type": "straight-in-taxi-through",
          "spotType": "passenger",
          "assistance": "vdgs-or-marshaller",
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

  Scenario: As operations I can list parking positions
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "77646d11-415c-4090-bc2b-e85cd1814b64",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "445",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "type": "angled",
          "spotType": "passenger",
          "assistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "no",
          "noiseSensitivityText": null,
          "noiseSensitivityStartTime": null,
          "noiseSensitivityEndTime": null,
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "ae098e8f-b088-41a6-a566-880c7dd5e931",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "A11",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "type": "angled",
          "spotType": "passenger",
          "assistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "yes",
          "noiseSensitivityText": "Night curfew: no engine runs or pushbacks permitted.",
          "noiseSensitivityStartTime": "21:00",
          "noiseSensitivityEndTime": "05:00",
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
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
        },
        {
          "id": "df5a931d-3b2e-4767-bdd4-1c14689e0e13",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "name": "N4",
          "bridge": "yes",
          "stairs": "no",
          "deicing": "mandatory",
          "deicingDescription": "Deicing pad shared with stand B6. Coordinate with ground ops.",
          "gpu": "both",
          "pca": "both",
          "type": "straight-in-taxi-through",
          "spotType": "passenger",
          "assistance": "vdgs-or-marshaller",
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

  Scenario: As a cabin crew I can list parking positions
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "77646d11-415c-4090-bc2b-e85cd1814b64",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "445",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "type": "angled",
          "spotType": "passenger",
          "assistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "no",
          "noiseSensitivityText": null,
          "noiseSensitivityStartTime": null,
          "noiseSensitivityEndTime": null,
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "ae098e8f-b088-41a6-a566-880c7dd5e931",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "A11",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "type": "angled",
          "spotType": "passenger",
          "assistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "yes",
          "noiseSensitivityText": "Night curfew: no engine runs or pushbacks permitted.",
          "noiseSensitivityStartTime": "21:00",
          "noiseSensitivityEndTime": "05:00",
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
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
        },
        {
          "id": "df5a931d-3b2e-4767-bdd4-1c14689e0e13",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "name": "N4",
          "bridge": "yes",
          "stairs": "no",
          "deicing": "mandatory",
          "deicingDescription": "Deicing pad shared with stand B6. Coordinate with ground ops.",
          "gpu": "both",
          "pca": "both",
          "type": "straight-in-taxi-through",
          "spotType": "passenger",
          "assistance": "vdgs-or-marshaller",
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

  Scenario: As a cabin crew I cannot list parking positions of non-existing airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/parking-position"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As an unauthorized user I can list parking positions
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/parking-position"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "77646d11-415c-4090-bc2b-e85cd1814b64",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "445",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "type": "angled",
          "spotType": "passenger",
          "assistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "no",
          "noiseSensitivityText": null,
          "noiseSensitivityStartTime": null,
          "noiseSensitivityEndTime": null,
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "ae098e8f-b088-41a6-a566-880c7dd5e931",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
          "name": "A11",
          "bridge": "no",
          "stairs": "with-bus-transport",
          "deicing": "no",
          "deicingDescription": null,
          "gpu": "standalone",
          "pca": "no",
          "type": "angled",
          "spotType": "passenger",
          "assistance": "marshaller",
          "location": "remote",
          "noiseSensitivity": "yes",
          "noiseSensitivityText": "Night curfew: no engine runs or pushbacks permitted.",
          "noiseSensitivityStartTime": "21:00",
          "noiseSensitivityEndTime": "05:00",
          "fuelingOptions": "truck",
          "coordinates": "@coordinates"
        },
        {
          "id": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "d7fd7a84-1589-4a4f-9072-a9773f66e2b5",
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
        },
        {
          "id": "df5a931d-3b2e-4767-bdd4-1c14689e0e13",
          "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "terminalId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
          "name": "N4",
          "bridge": "yes",
          "stairs": "no",
          "deicing": "mandatory",
          "deicingDescription": "Deicing pad shared with stand B6. Coordinate with ground ops.",
          "gpu": "both",
          "pca": "both",
          "type": "straight-in-taxi-through",
          "spotType": "passenger",
          "assistance": "vdgs-or-marshaller",
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
