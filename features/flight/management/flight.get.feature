Feature: Get flight

  Scenario: As an admin I can get flight
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05",
        "flightNumber": "LH450",
        "callsign": "DLH450",
        "atcCallsign": null,
        "status": "created",
        "timesheet": {
          "scheduled": {
            "arrivalTime": "2025-01-01T21:00:00.000Z",
            "onBlockTime": "2025-01-01T21:10:00.000Z",
            "takeoffTime": "2025-01-01T12:15:00.000Z",
            "offBlockTime": "2025-01-01T12:00:00.000Z"
          }
        },
        "loadsheets": {
          "preliminary": null,
          "final": null
        },
        "aircraft": {
          "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
          "icaoCode": "A339",
          "shortName": "Airbus A330",
          "fullName": "Airbus A330-900 neo",
          "registration": "D-AIMC",
          "selcal": "LR-CK",
          "livery": "Fanhansa (2024)",
          "operator": {
            "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
            "icaoCode": "DLH",
            "iataCode": "LH",
            "shortName": "Lufthansa",
            "fullName": "Deutsche Lufthansa AG",
            "callsign": "LUFTHANSA"
          }
        },
        "operator": {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA"
        },
        "airports": [
          {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "city": "Frankfurt",
            "name": "Frankfurt Rhein/Main",
            "country": "Germany",
            "timezone": "Europe/Berlin",
            "type": "departure",
            "continent": "europe",
            "location": {
              "longitude": 8.57397,
              "latitude": 50.04693
            }
          },
          {
            "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
            "icaoCode": "KJFK",
            "iataCode": "JFK",
            "city": "New York",
            "name": "New York JFK",
            "country": "United States of America",
            "timezone": "America/New_York",
            "type": "destination",
            "continent": "north_america",
            "location": {
              "longitude": -73.7781,
              "latitude": 40.6413
            }
          },
          {
            "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
            "icaoCode": "KPHL",
            "iataCode": "PHL",
            "city": "Philadelphia",
            "name": "Philadelphia Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "type": "destination_alternate",
            "continent": "north_america",
            "location": {
              "longitude": -75.24349,
              "latitude": 39.87113
            }
          },
          {
            "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
            "icaoCode": "KBOS",
            "iataCode": "BOS",
            "city": "Boston",
            "name": "Boston Logan Intl",
            "country": "United States of America",
            "timezone": "America/New_York",
            "type": "destination_alternate",
            "continent": "north_america",
            "location": {
              "longitude": -71.01663,
              "latitude": 42.36454
            }
          },
          {
            "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
            "icaoCode": "CYYT",
            "iataCode": "YYT",
            "city": "St. Johns",
            "name": "St. Johns Intl",
            "country": "Canada",
            "timezone": "America/St_Johns",
            "continent": "north_america",
            "type": "etops_alternate",
            "location": {
              "longitude": -52.751945,
              "latitude": 47.61861
            }
          }
        ],
        "isFlightDiverted": false,
        "source": "manual",
        "tracking": "private",
        "rotationId": null,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
      """

  Scenario: As operations I can get flight
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 200

  Scenario: As a cabin crew I can get flight
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 200

  Scenario: As an unauthorized user I cannot get flight
    When I send a "GET" request to "/api/v1/flight/3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05"
    Then the response status should be 200

  Scenario: As a cabin crew I cannot get flight that does not exist
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/ef95408a-bb6e-4f4e-9d87-6403164cb4df"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Flight with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot get flight with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
