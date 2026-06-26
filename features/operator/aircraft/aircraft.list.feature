Feature: List aircraft

  Scenario: As an admin I can list aircraft
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Fanhansa (2024)",
          "registration": "D-AIMC",
          "selcal": "LR-CK",
          "currentState": "idle",
          "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportId": null,
          "lastAirportUpdatedAt": null
        },
        {
          "id": "ac000000-0000-4000-8000-000000000014",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Star Alliance (2023)",
          "registration": "D-AIMD",
          "selcal": "BD-EF",
          "currentState": "idle",
          "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z"
        },
        {
          "id": "ac000000-0000-4000-8000-000000000015",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Lovehansa (2024)",
          "registration": "D-AIME",
          "selcal": "BD-EG",
          "currentState": "idle",
          "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z"
        },
        {
          "id": "ac000000-0000-4000-8000-000000000016",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "New Livery (2018)",
          "registration": "D-AIMF",
          "selcal": "BD-FG",
          "currentState": "idle",
          "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z"
        },
        {
          "id": "ac000000-0000-4000-8000-000000000017",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Retro 1970s (2022)",
          "registration": "D-AIMG",
          "selcal": "BE-FG",
          "currentState": "idle",
          "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z"
        },
        {
          "id": "ac000000-0000-4000-8000-000000000018",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Siegerflieger (2023)",
          "registration": "D-AIMH",
          "selcal": "CD-EF",
          "currentState": "idle",
          "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z"
        },
        {
          "id": "ac000000-0000-4000-8000-000000000019",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Cheers to 70 Years (2025)",
          "registration": "D-AIMK",
          "selcal": "CD-EG",
          "currentState": "idle",
          "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z"
        },
        {
          "id": "ac000000-0000-4000-8000-000000000020",
          "airframe": {
            "type": "A339",
            "name": "A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Munich (2024)",
          "registration": "D-AIML",
          "selcal": "CE-FG",
          "currentState": "idle",
          "baseAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z"
        }
      ]
      """

  Scenario: As operations I can list aircraft
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft"
    Then the response status should be 200

  Scenario: As an cabin crew I can list aircraft
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft"
    Then the response status should be 200

  Scenario: As operations I cannot get aircraft list for non-existing operator
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/16b531c3-d817-4326-841c-2a4c243f9c1f/aircraft"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Operator with given ID not found."
      }
      """

  Scenario: As operations I cannot create aircraft with incorrect uuid
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/incorrect-uuid/aircraft"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot list aircraft
    When I send a "GET" request to "/api/v1/operator/40b1b34e-aea1-4cec-acbe-f2bf97c06d7d/aircraft"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
