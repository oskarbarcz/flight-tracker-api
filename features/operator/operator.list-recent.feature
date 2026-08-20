Feature: List recent operators

  Scenario: As operations I get the four carriers I most recently dispatched or flew
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator?recentOnly=true"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "7d724b05-8eb9-4e66-84cc-bb101369d1a0",
          "icaoCode": "KLM",
          "iataCode": "KL",
          "shortName": "KLM",
          "fullName": "KLM Royal Dutch Airlines",
          "callsign": "KLM",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["AMS"],
          "fleetSize": 1,
          "fleetTypes": ["B738"],
          "avgFleetAge": 11.8,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/klm.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "sky_team",
          "group": "air_france_klm"
        },
        {
          "id": "3a1354c5-d9fb-428b-9f87-0e887e491f0d",
          "icaoCode": "AFR",
          "iataCode": "AF",
          "shortName": "Air France",
          "fullName": "Société Air France S.A.",
          "callsign": "AIRFRANS",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["CDG", "ORY"],
          "fleetSize": 1,
          "fleetTypes": ["A320"],
          "avgFleetAge": 13.4,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/air_france.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "sky_team",
          "group": "air_france_klm"
        },
        {
          "id": "e4ba1445-b413-49a9-b0c5-c8bd3df14b42",
          "icaoCode": "ICE",
          "iataCode": "FI",
          "shortName": "Icelandair",
          "fullName": "Icelandair ehf.",
          "callsign": "ICEAIR",
          "type": "legacy",
          "serviceType": "passenger",
          "hubs": ["KEF"],
          "fleetSize": 1,
          "fleetTypes": ["B752"],
          "avgFleetAge": 20.1,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/icelandair.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": null,
          "group": null
        },
        {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["FRA", "MUC"],
          "fleetSize": 8,
          "fleetTypes": ["A339"],
          "avgFleetAge": 14.2,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lufthansa.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "star_alliance",
          "group": "lufthansa_group"
        }
      ]
      """

  Scenario: As a cabin crew I get only the carriers I have flown as captain
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator?recentOnly=true"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["FRA", "MUC"],
          "fleetSize": 8,
          "fleetTypes": ["A339"],
          "avgFleetAge": 14.2,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lufthansa.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "star_alliance",
          "group": "lufthansa_group"
        },
        {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "iataCode": "AA",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["CLT", "DFW", "JFK", "LAX", "MIA", "ORD", "LGA", "PHL", "PHX", "DCA"],
          "fleetSize": 14,
          "fleetTypes": ["B77W"],
          "avgFleetAge": 14.4,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/american_airlines.png",
          "backgroundUrl": null,
          "continent": "north_america",
          "alliance": "oneworld",
          "group": null
        },
        {
          "id": "3a1354c5-d9fb-428b-9f87-0e887e491f0d",
          "icaoCode": "AFR",
          "iataCode": "AF",
          "shortName": "Air France",
          "fullName": "Soci\u00e9t\u00e9 Air France S.A.",
          "callsign": "AIRFRANS",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["CDG", "ORY"],
          "fleetSize": 1,
          "fleetTypes": ["A320"],
          "avgFleetAge": 13.4,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/air_france.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "sky_team",
          "group": "air_france_klm"
        },
        {
          "id": "5c649579-22eb-4c07-a96c-b74a77f53871",
          "icaoCode": "CFG",
          "iataCode": "DE",
          "shortName": "Condor",
          "fullName": "Condor Flugdienst",
          "callsign": "CONDOR",
          "type": "low_cost",
          "serviceType": "passenger",
          "hubs": ["BER", "DUS", "FRA", "HAM", "MUC", "STR", "ZRH"],
          "fleetSize": 2,
          "fleetTypes": ["A321", "A319"],
          "avgFleetAge": 9.2,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/condor.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": null,
          "group": null
        }
      ]
      """

  Scenario: As an admin who has neither flown nor dispatched I get an empty list
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator?recentOnly=true"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: Requesting the recent carriers does not serve the full list from cache
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator?recentOnly=true"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """
    When I send a "GET" request to "/api/v1/operator"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "5c649579-22eb-4c07-a96c-b74a77f53871",
          "icaoCode": "CFG",
          "iataCode": "DE",
          "shortName": "Condor",
          "fullName": "Condor Flugdienst",
          "callsign": "CONDOR",
          "type": "low_cost",
          "serviceType": "passenger",
          "hubs": ["BER", "DUS", "FRA", "HAM", "MUC", "STR", "ZRH"],
          "fleetSize": 2,
          "fleetTypes": ["A321", "A319"],
          "avgFleetAge": 9.2,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/condor.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": null,
          "group": null
        },
        {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["FRA", "MUC"],
          "fleetSize": 8,
          "fleetTypes": ["A339"],
          "avgFleetAge": 14.2,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lufthansa.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "star_alliance",
          "group": "lufthansa_group"
        },
        {
          "id": "1d85d597-c3a1-43cf-b888-10d674ea7a46",
          "icaoCode": "LOT",
          "iataCode": "LO",
          "shortName": "LOT",
          "fullName": "Polskie Linie Lotnicze LOT",
          "callsign": "LOT",
          "type": "legacy",
          "serviceType": "passenger",
          "hubs": ["WAW"],
          "fleetSize": 0,
          "fleetTypes": [],
          "avgFleetAge": 11.1,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lot_polish.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "star_alliance",
          "group": null
        },
        {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "iataCode": "AA",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["CLT", "DFW", "JFK", "LAX", "MIA", "ORD", "LGA", "PHL", "PHX", "DCA"],
          "fleetSize": 14,
          "fleetTypes": ["B77W"],
          "avgFleetAge": 14.4,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/american_airlines.png",
          "backgroundUrl": null,
          "continent": "north_america",
          "alliance": "oneworld",
          "group": null
        },
        {
          "id": "5c00f71c-287c-4bca-a738-caf7e2669c65",
          "icaoCode": "BAW",
          "iataCode": "BA",
          "shortName": "British Airways",
          "fullName": "British Airways plc",
          "callsign": "SPEEDBIRD",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["LHR"],
          "fleetSize": 0,
          "fleetTypes": [],
          "avgFleetAge": 13.6,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/british_airways.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "oneworld",
          "group": "international_airlines_group"
        },
        {
          "id": "3a1354c5-d9fb-428b-9f87-0e887e491f0d",
          "icaoCode": "AFR",
          "iataCode": "AF",
          "shortName": "Air France",
          "fullName": "Société Air France S.A.",
          "callsign": "AIRFRANS",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["CDG", "ORY"],
          "fleetSize": 1,
          "fleetTypes": ["A320"],
          "avgFleetAge": 13.4,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/air_france.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "sky_team",
          "group": "air_france_klm"
        },
        {
          "id": "e4ba1445-b413-49a9-b0c5-c8bd3df14b42",
          "icaoCode": "ICE",
          "iataCode": "FI",
          "shortName": "Icelandair",
          "fullName": "Icelandair ehf.",
          "callsign": "ICEAIR",
          "type": "legacy",
          "serviceType": "passenger",
          "hubs": ["KEF"],
          "fleetSize": 1,
          "fleetTypes": ["B752"],
          "avgFleetAge": 20.1,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/icelandair.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": null,
          "group": null
        },
        {
          "id": "7d724b05-8eb9-4e66-84cc-bb101369d1a0",
          "icaoCode": "KLM",
          "iataCode": "KL",
          "shortName": "KLM",
          "fullName": "KLM Royal Dutch Airlines",
          "callsign": "KLM",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["AMS"],
          "fleetSize": 1,
          "fleetTypes": ["B738"],
          "avgFleetAge": 11.8,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/klm.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "sky_team",
          "group": "air_france_klm"
        },
        {
          "id": "ae07aa28-8bac-4cd7-91fc-12c76e1b6807",
          "icaoCode": "CLX",
          "iataCode": "CV",
          "shortName": "Cargolux",
          "fullName": "Cargolux Airlines International S.A.",
          "callsign": "CARGOLUX",
          "type": "legacy",
          "serviceType": "cargo",
          "hubs": ["LUX"],
          "fleetSize": 0,
          "fleetTypes": [],
          "avgFleetAge": 13.5,
          "logoUrl": null,
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": null,
          "group": null
        }
      ]
      """

  Scenario: Disabling the filter returns the full operator list
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator?recentOnly=false"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "5c649579-22eb-4c07-a96c-b74a77f53871",
          "icaoCode": "CFG",
          "iataCode": "DE",
          "shortName": "Condor",
          "fullName": "Condor Flugdienst",
          "callsign": "CONDOR",
          "type": "low_cost",
          "serviceType": "passenger",
          "hubs": ["BER", "DUS", "FRA", "HAM", "MUC", "STR", "ZRH"],
          "fleetSize": 2,
          "fleetTypes": ["A321", "A319"],
          "avgFleetAge": 9.2,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/condor.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": null,
          "group": null
        },
        {
          "id": "40b1b34e-aea1-4cec-acbe-f2bf97c06d7d",
          "icaoCode": "DLH",
          "iataCode": "LH",
          "shortName": "Lufthansa",
          "fullName": "Deutsche Lufthansa AG",
          "callsign": "LUFTHANSA",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["FRA", "MUC"],
          "fleetSize": 8,
          "fleetTypes": ["A339"],
          "avgFleetAge": 14.2,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lufthansa.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "star_alliance",
          "group": "lufthansa_group"
        },
        {
          "id": "1d85d597-c3a1-43cf-b888-10d674ea7a46",
          "icaoCode": "LOT",
          "iataCode": "LO",
          "shortName": "LOT",
          "fullName": "Polskie Linie Lotnicze LOT",
          "callsign": "LOT",
          "type": "legacy",
          "serviceType": "passenger",
          "hubs": ["WAW"],
          "fleetSize": 0,
          "fleetTypes": [],
          "avgFleetAge": 11.1,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/lot_polish.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "star_alliance",
          "group": null
        },
        {
          "id": "1f630d38-ad24-47cc-950b-3783e71bbd10",
          "icaoCode": "AAL",
          "iataCode": "AA",
          "shortName": "American Airlines",
          "fullName": "American Airlines, Inc.",
          "callsign": "AMERICAN",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["CLT", "DFW", "JFK", "LAX", "MIA", "ORD", "LGA", "PHL", "PHX", "DCA"],
          "fleetSize": 14,
          "fleetTypes": ["B77W"],
          "avgFleetAge": 14.4,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/american_airlines.png",
          "backgroundUrl": null,
          "continent": "north_america",
          "alliance": "oneworld",
          "group": null
        },
        {
          "id": "5c00f71c-287c-4bca-a738-caf7e2669c65",
          "icaoCode": "BAW",
          "iataCode": "BA",
          "shortName": "British Airways",
          "fullName": "British Airways plc",
          "callsign": "SPEEDBIRD",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["LHR"],
          "fleetSize": 0,
          "fleetTypes": [],
          "avgFleetAge": 13.6,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/british_airways.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "oneworld",
          "group": "international_airlines_group"
        },
        {
          "id": "3a1354c5-d9fb-428b-9f87-0e887e491f0d",
          "icaoCode": "AFR",
          "iataCode": "AF",
          "shortName": "Air France",
          "fullName": "Société Air France S.A.",
          "callsign": "AIRFRANS",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["CDG", "ORY"],
          "fleetSize": 1,
          "fleetTypes": ["A320"],
          "avgFleetAge": 13.4,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/air_france.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "sky_team",
          "group": "air_france_klm"
        },
        {
          "id": "e4ba1445-b413-49a9-b0c5-c8bd3df14b42",
          "icaoCode": "ICE",
          "iataCode": "FI",
          "shortName": "Icelandair",
          "fullName": "Icelandair ehf.",
          "callsign": "ICEAIR",
          "type": "legacy",
          "serviceType": "passenger",
          "hubs": ["KEF"],
          "fleetSize": 1,
          "fleetTypes": ["B752"],
          "avgFleetAge": 20.1,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/icelandair.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": null,
          "group": null
        },
        {
          "id": "7d724b05-8eb9-4e66-84cc-bb101369d1a0",
          "icaoCode": "KLM",
          "iataCode": "KL",
          "shortName": "KLM",
          "fullName": "KLM Royal Dutch Airlines",
          "callsign": "KLM",
          "type": "legacy",
          "serviceType": "both",
          "hubs": ["AMS"],
          "fleetSize": 1,
          "fleetTypes": ["B738"],
          "avgFleetAge": 11.8,
          "logoUrl": "https://api-ninjas-data.s3.us-west-2.amazonaws.com/airline_logos/brandmark/klm.png",
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": "sky_team",
          "group": "air_france_klm"
        },
        {
          "id": "ae07aa28-8bac-4cd7-91fc-12c76e1b6807",
          "icaoCode": "CLX",
          "iataCode": "CV",
          "shortName": "Cargolux",
          "fullName": "Cargolux Airlines International S.A.",
          "callsign": "CARGOLUX",
          "type": "legacy",
          "serviceType": "cargo",
          "hubs": ["LUX"],
          "fleetSize": 0,
          "fleetTypes": [],
          "avgFleetAge": 13.5,
          "logoUrl": null,
          "backgroundUrl": null,
          "continent": "europe",
          "alliance": null,
          "group": null
        }
      ]
      """

  Scenario: As a cabin crew I cannot pass an unsupported filter value
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator?recentOnly=maybe"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "recentOnly": ["recentOnly must be a boolean value"]
        }
      }
      """

  Scenario: As a cabin crew I cannot pass the filter without a value
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator?recentOnly"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "recentOnly": ["recentOnly must be a boolean value"]
        }
      }
      """

  Scenario: As a cabin crew the former hyphenated spelling of the filter is not accepted
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator?recent-only=true"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "recent-only": ["property recent-only should not exist"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot list recent operators
    When I send a "GET" request to "/api/v1/operator?recentOnly=true"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
