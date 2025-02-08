Feature: List operators

  Scenario: As an admin I can list operators
    Given I use seed data
    And I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator"
    Then the response status should be 200
    And the response body should contain:
    """json
    [
      {
        "id": "5c649579-22eb-4c07-a96c-b74a77f53871",
        "icaoCode": "CDG",
        "shortName": "Condor",
        "fullName": "Condor Flugdienst",
        "callsign": "CONDOR"
      },
      {
        "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
        "icaoCode": "DLH",
        "shortName": "Lufthansa",
        "fullName": "Deutsche Lufthansa AG",
        "callsign": "LUFTHANSA"
      },
      {
        "id": "1d85d597-c3a1-43cf-b888-10d674ea7a46",
        "icaoCode": "LOT",
        "shortName": "LOT",
        "fullName": "Polskie Linie Lotnicze LOT",
        "callsign": "LOT"
      },
      {
        "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
        "icaoCode": "AAL",
        "shortName": "American Airlines",
        "fullName": "American Airlines, Inc.",
        "callsign": "AMERICAN"
      },
      {
        "id": "5c00f71c-287c-4bca-a738-caf7e2669c65",
        "icaoCode": "BAW",
        "shortName": "British Airways",
        "fullName": "British Airways plc",
        "callsign": "SPEEDBIRD"
      }
    ]
    """

  Scenario: As operations I can list operators
    Given I use seed data
    And I am signed in as "operations"
    Given I use seed data
    When I send a "GET" request to "/api/v1/operator"
    Then the response status should be 200

  Scenario: As a cabin crew I can list operators
    Given I use seed data
    And I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator"
    Then the response status should be 200

  Scenario: As an unauthorized user I cannot list operators
    When I send a "GET" request to "/api/v1/operator"
    Then the response status should be 401
    And the response body should contain:
    """json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    """
