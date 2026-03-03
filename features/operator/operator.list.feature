Feature: List operators

  Scenario: As an admin I can list operators
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "5c649579-22eb-4c07-a96c-b74a77f53871",
          "icaoCode": "CDG",
          "iataCode": "DE",
          "shortName": "Condor",
          "fullName": "Condor Flugdienst",
          "callsign": "CONDOR",
          "type": "low_cost",
          "hubs": ["BER", "DUS", "FRA", "HAM", "MUC", "STR", "ZRH"],
          "fleetSize": 2,
          "fleetTypes": ["A321", "A319"],
          "avgFleetAge": 9.2,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/condor.png",
          "backgroundUrl": null,
          "continent": "europe"
        },
        {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA",
          "type": "legacy",
          "hubs": ["FRA", "MUC"],
          "fleetSize": 1,
          "fleetTypes": ["A339"],
          "avgFleetAge": 14.2,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lufthansa.png",
          "backgroundUrl": null,
          "continent": "europe"
        },
        {
          "id": "1d85d597-c3a1-43cf-b888-10d674ea7a46",
          "icaoCode": "LOT",
          "iataCode": "LO",
          "shortName": "LOT",
          "fullName": "Polskie Linie Lotnicze LOT",
          "callsign": "LOT",
          "type": "legacy",
          "hubs": ["WAW"],
          "fleetSize": 0,
          "fleetTypes": [],
          "avgFleetAge": 11.1,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lot_polish.png",
          "backgroundUrl": null,
          "continent": "europe"
        },
        {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "iataCode": "AA",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN",
          "type": "legacy",
          "hubs": ["CLT", "DFW", "JFK", "LAX", "MIA", "ORD", "LGA", "PHL", "PHX", "DCA"],
          "fleetSize": 1,
          "fleetTypes": ["B77W"],
          "avgFleetAge": 14.4,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/american_airlines.png",
          "backgroundUrl": null,
          "continent": "north_america"
        },
        {
          "id": "5c00f71c-287c-4bca-a738-caf7e2669c65",
          "icaoCode": "BAW",
          "iataCode": "BA",
          "shortName": "British Airways",
          "fullName": "British Airways plc",
          "callsign": "SPEEDBIRD",
          "type": "legacy",
          "hubs": ["LHR"],
          "fleetSize": 0,
          "fleetTypes": [],
          "avgFleetAge": 13.6,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/british_airways.png",
          "backgroundUrl": null,
          "continent": "europe"
        }
      ]
      """

  Scenario: As operations I can list operators
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator"
    Then the response status should be 200

  Scenario: As a cabin crew I can list operators
    Given I am signed in as "cabin crew"
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
