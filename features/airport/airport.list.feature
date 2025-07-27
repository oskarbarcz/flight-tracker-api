Feature: List airports

  Scenario: As an admin I can list airports
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "icaoCode": "EDDF",
          "iataCode": "FRA",
          "city": "Frankfurt",
          "name": "Frankfurt Rhein/Main",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "location": {
            "longitude": 8.57397,
            "latitude": 50.04693
          }
        },
        {
          "id": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "icaoCode": "EPWA",
          "iataCode": "WAW",
          "city": "Warsaw",
          "name": "Warsaw Chopin",
          "country": "Poland",
          "timezone": "Europe/Warsaw",
          "continent": "europe",
          "location": {
            "longitude": 20.967123,
            "latitude": 52.16575
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
          "continent": "north_america",
          "location": {
            "longitude": -73.7781,
            "latitude": 40.6413
          }
        },
        {
          "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
          "icaoCode": "LFPG",
          "iataCode": "CDG",
          "city": "Paris",
          "name": "Paris Charles de Gaulle",
          "country": "France",
          "timezone": "Europe/Paris",
          "continent": "europe",
          "location": {
            "longitude": 8.570556,
            "latitude": 50.033333
          }
        },
        {
          "id": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
          "icaoCode": "CYYR",
          "iataCode": "YYR",
          "city": "Goose Bay",
          "name": "Goose Bay Intl",
          "country": "Canada",
          "timezone": "America/Goose_Bay",
          "continent": "north_america",
          "location": {
            "longitude": -60.409444,
            "latitude": 53.319168
          }
        },
        {
          "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
          "icaoCode": "BIRK",
          "iataCode": "KEF",
          "city": "Reykjavik",
          "name": "Reykjavik Keflavik",
          "country": "Iceland",
          "timezone": "Atlantic/Reykjavik",
          "continent": "europe",
          "location": {
            "longitude": -21.9406,
            "latitude": 64.13
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
          "location": {
            "longitude": -52.751945,
            "latitude": 47.61861
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
          "continent": "north_america",
          "location": {
            "longitude": -71.01663,
            "latitude": 42.36454
          }
        },
        {
          "id": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
          "icaoCode": "EDDW",
          "iataCode": "BRE",
          "city": "Bremen",
          "name": "Bremen",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "location": {
            "longitude": 8.786667,
            "latitude": 53.0475
          }
        }
      ]
      """

  Scenario: As operations I can list airports
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport"
    Then the response status should be 200

  Scenario: As a cabin crew I can list airports
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport"
    Then the response status should be 200

  Scenario: As a cabin crew I can filter airports by continent
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport?continent=europe"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "icaoCode": "EDDF",
          "iataCode": "FRA",
          "city": "Frankfurt",
          "name": "Frankfurt Rhein/Main",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "location": {
            "longitude": 8.57397,
            "latitude": 50.04693
          }
        },
        {
          "id": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "icaoCode": "EPWA",
          "iataCode": "WAW",
          "city": "Warsaw",
          "name": "Warsaw Chopin",
          "country": "Poland",
          "timezone": "Europe/Warsaw",
          "continent": "europe",
          "location": {
            "longitude": 20.967123,
            "latitude": 52.16575
          }
        },
        {
          "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
          "icaoCode": "LFPG",
          "iataCode": "CDG",
          "city": "Paris",
          "name": "Paris Charles de Gaulle",
          "country": "France",
          "timezone": "Europe/Paris",
          "continent": "europe",
          "location": {
            "longitude": 8.570556,
            "latitude": 50.033333
          }
        },
        {
          "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
          "icaoCode": "BIRK",
          "iataCode": "KEF",
          "city": "Reykjavik",
          "name": "Reykjavik Keflavik",
          "country": "Iceland",
          "timezone": "Atlantic/Reykjavik",
          "continent": "europe",
          "location": {
            "longitude": -21.9406,
            "latitude": 64.13
          }
        },
        {
          "id": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
          "icaoCode": "EDDW",
          "iataCode": "BRE",
          "city": "Bremen",
          "name": "Bremen",
          "country": "Germany",
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "location": {
            "longitude": 8.786667,
            "latitude": 53.0475
          }
        }
      ]
      """

  Scenario: As a cabin crew I cannot filter airports by incorrect continent
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport?continent=not-a-continent"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "continent": [
            "continent must be one of the following values: africa, asia, europe, north_america, oceania, south_america"
          ]
        }
      }
      """
