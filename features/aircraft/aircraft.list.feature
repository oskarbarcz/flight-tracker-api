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
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Fanhansa (2024)",
          "registration": "D-AIMC",
          "selcal": "LR-CK",
          "currentState": "planned",
          "etopsThresholdMinutes": 180,
          "baseAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirport": null,
          "lastAirportUpdatedAt": null,
          "lastParkingPosition": null
        },
        {
          "id": "b84e4c67-7565-4846-84c4-ab8215308fbd",
          "airframe": {
            "type": "A339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Star Alliance (2023)",
          "registration": "D-AIMD",
          "selcal": "BD-EF",
          "currentState": "idle",
          "etopsThresholdMinutes": null,
          "baseAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "iataCode": "JFK",
            "name": "New York JFK",
            "city": "New York",
            "country": "United States of America",
            "location": "@coordinates"
          },
          "lastAirportUpdatedAt": "2025-01-02T02:45:00.000Z",
          "lastParkingPosition": {
            "id": "e74b3184-4bdd-4055-b8ce-62d7d95df0fb",
            "name": "B20B",
            "coordinates": "@coordinates"
          }
        },
        {
          "id": "becc1596-dfa0-452b-81ec-3f1f2fa0dce2",
          "airframe": {
            "type": "A339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Lovehansa (2024)",
          "registration": "D-AIME",
          "selcal": "BD-EG",
          "currentState": "planned",
          "etopsThresholdMinutes": null,
          "baseAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z",
          "lastParkingPosition": {
            "id": "ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9",
            "name": "B 42",
            "coordinates": "@coordinates"
          }
        },
        {
          "id": "a9b9205d-53b1-4eec-bb24-548a12159997",
          "airframe": {
            "type": "A339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "New Livery (2018)",
          "registration": "D-AIMF",
          "selcal": "BD-FG",
          "currentState": "idle",
          "etopsThresholdMinutes": null,
          "baseAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirportUpdatedAt": "2025-01-01T16:28:00.000Z",
          "lastParkingPosition": null
        },
        {
          "id": "ed7ed4bb-95ff-4e79-9331-11212ef727ec",
          "airframe": {
            "type": "A339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Retro 1970s (2022)",
          "registration": "D-AIMG",
          "selcal": "BE-FG",
          "currentState": "cruise",
          "etopsThresholdMinutes": null,
          "baseAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirport": {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "iataCode": "JFK",
            "name": "New York JFK",
            "city": "New York",
            "country": "United States of America",
            "location": "@coordinates"
          },
          "lastAirportUpdatedAt": "2025-01-01T12:00:00.000Z",
          "lastParkingPosition": null
        },
        {
          "id": "5637d186-d9e4-45e4-9940-ae6f6552c9ae",
          "airframe": {
            "type": "A339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Siegerflieger (2023)",
          "registration": "D-AIMH",
          "selcal": "CD-EF",
          "currentState": "cruise",
          "etopsThresholdMinutes": null,
          "baseAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z",
          "lastParkingPosition": null
        },
        {
          "id": "785bdfda-291a-4c11-a5d9-b57b5c0b8e5e",
          "airframe": {
            "type": "A339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Cheers to 70 Years (2025)",
          "registration": "D-AIMK",
          "selcal": "CD-EG",
          "currentState": "planned",
          "etopsThresholdMinutes": null,
          "baseAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z",
          "lastParkingPosition": null
        },
        {
          "id": "cfedcfae-6e80-4801-8a89-12b2430c908b",
          "airframe": {
            "type": "A339",
            "name": "Airbus A330-900",
            "cruiseSpeed": { "value": 0.8, "unit": "mach" },
            "serviceCeiling": 41400,
            "performanceCode": "D",
            "weightCategory": "heavy"
          },
          "livery": "Munich (2024)",
          "registration": "D-AIML",
          "selcal": "CE-FG",
          "currentState": "cruise",
          "etopsThresholdMinutes": null,
          "baseAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main",
            "city": "Frankfurt",
            "country": "Germany",
            "location": "@coordinates"
          },
          "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z",
          "lastParkingPosition": null
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
