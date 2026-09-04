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
          "city": {
            "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
            "name": "Frankfurt"
          },
          "name": "Frankfurt Rhein/Main",
          "country": {
            "code": "DE",
            "name": "Germany"
          },
          "timezone": "Europe/Berlin",
          "location": {
            "latitude": 50.04693,
            "longitude": 8.57397
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "icaoCode": "EPWA",
          "iataCode": "WAW",
          "city": {
            "id": "ec2d2121-804b-4f8f-a9d7-991ebd8465e8",
            "name": "Warsaw"
          },
          "name": "Warsaw Chopin",
          "country": {
            "code": "PL",
            "name": "Poland"
          },
          "timezone": "Europe/Warsaw",
          "location": {
            "latitude": 52.16575,
            "longitude": 20.967123
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "icaoCode": "KJFK",
          "iataCode": "JFK",
          "city": {
            "id": "6ef8953e-7c45-417a-b850-7e3c53de54cd",
            "name": "New York"
          },
          "name": "New York JFK",
          "country": {
            "code": "US",
            "name": "United States of America"
          },
          "timezone": "America/New_York",
          "location": {
            "latitude": 40.6413,
            "longitude": -73.7781
          },
          "continent": "north_america",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
          "icaoCode": "LFPG",
          "iataCode": "CDG",
          "city": {
            "id": "17c8f21f-b5a3-41f5-a1e3-16f4100c2342",
            "name": "Paris"
          },
          "name": "Paris Charles de Gaulle",
          "country": {
            "code": "FR",
            "name": "France"
          },
          "timezone": "Europe/Paris",
          "location": {
            "latitude": 49.00896,
            "longitude": 2.55412
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "fa8ee2e9-fb94-4416-9ed0-4811efd488ae",
          "icaoCode": "CYYR",
          "iataCode": "YYR",
          "city": {
            "id": "4670768b-9029-4de4-a078-19284031b8c5",
            "name": "Goose Bay"
          },
          "name": "Goose Bay Intl",
          "country": {
            "code": "CA",
            "name": "Canada"
          },
          "timezone": "America/Goose_Bay",
          "location": {
            "latitude": 53.319168,
            "longitude": -60.409444
          },
          "continent": "north_america",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
          "icaoCode": "BIKF",
          "iataCode": "KEF",
          "city": {
            "id": "bb33c063-d0c3-4468-98ce-a048a78f409a",
            "name": "Reykjavik"
          },
          "name": "Reykjavik Keflavik",
          "country": {
            "code": "IS",
            "name": "Iceland"
          },
          "timezone": "Atlantic/Reykjavik",
          "location": {
            "latitude": 63.985,
            "longitude": -22.6056
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
          "icaoCode": "CYYT",
          "iataCode": "YYT",
          "city": {
            "id": "e5c4da3c-30af-4a50-be48-832cdb854cd7",
            "name": "St. Johns"
          },
          "name": "St. Johns Intl",
          "country": {
            "code": "CA",
            "name": "Canada"
          },
          "timezone": "America/St_Johns",
          "location": {
            "latitude": 47.61861,
            "longitude": -52.751945
          },
          "continent": "north_america",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
          "icaoCode": "KPHL",
          "iataCode": "PHL",
          "city": {
            "id": "e30d5e72-29ca-4f01-8e75-fdc55e3b296a",
            "name": "Philadelphia"
          },
          "name": "Philadelphia Intl",
          "country": {
            "code": "US",
            "name": "United States of America"
          },
          "timezone": "America/New_York",
          "location": {
            "latitude": 39.87113,
            "longitude": -75.24349
          },
          "continent": "north_america",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "c03a79fb-c5ae-46c3-95fe-f3b5dc7b85f3",
          "icaoCode": "KBOS",
          "iataCode": "BOS",
          "city": {
            "id": "19364a7d-3982-43e5-9630-9ce7c3a44e98",
            "name": "Boston"
          },
          "name": "Boston Logan Intl",
          "country": {
            "code": "US",
            "name": "United States of America"
          },
          "timezone": "America/New_York",
          "location": {
            "latitude": 42.36454,
            "longitude": -71.01663
          },
          "continent": "north_america",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
          "icaoCode": "EDDW",
          "iataCode": "BRE",
          "city": {
            "id": "11fe7e0d-ef97-4a1d-9a87-8ad9da64fd91",
            "name": "Bremen"
          },
          "name": "Bremen",
          "country": {
            "code": "DE",
            "name": "Germany"
          },
          "timezone": "Europe/Berlin",
          "location": {
            "latitude": 53.0475,
            "longitude": 8.786667
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "93a9db1c-5047-489c-a018-178c3abd8a02",
          "icaoCode": "LFPO",
          "iataCode": "ORY",
          "city": {
            "id": "17c8f21f-b5a3-41f5-a1e3-16f4100c2342",
            "name": "Paris"
          },
          "name": "Paris Orly",
          "country": {
            "code": "FR",
            "name": "France"
          },
          "timezone": "Europe/Paris",
          "location": {
            "latitude": 48.7233,
            "longitude": 2.35944
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": null
        },
        {
          "id": "2f1c5a84-6d3b-4e77-9a12-8c5b3e9d4f60",
          "icaoCode": "EINN",
          "iataCode": "SNN",
          "city": {
            "id": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83",
            "name": "Shannon"
          },
          "name": "Shannon Intl",
          "country": {
            "code": "IE",
            "name": "Ireland"
          },
          "timezone": "Europe/Dublin",
          "location": {
            "latitude": 52.701978,
            "longitude": -8.924817
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "8b47e2d1-3f96-4c58-b0a7-6d2e9f1c4a83",
          "icaoCode": "CYQX",
          "iataCode": "YQX",
          "city": {
            "id": "7d1b4f96-2a58-4c67-b3e9-8f5c1a7d2e64",
            "name": "Gander"
          },
          "name": "Gander Intl",
          "country": {
            "code": "CA",
            "name": "Canada"
          },
          "timezone": "America/St_Johns",
          "location": {
            "latitude": 48.936901,
            "longitude": -54.5681
          },
          "continent": "north_america",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "c39d6f52-84a1-4b73-9e6c-1f8a3d7b5e29",
          "icaoCode": "EIKN",
          "iataCode": "NOC",
          "city": {
            "id": "b6e3a827-4d19-4f52-9c7a-3e8b5d1f6a94",
            "name": "Knock"
          },
          "name": "Ireland West Knock",
          "country": {
            "code": "IE",
            "name": "Ireland"
          },
          "timezone": "Europe/Dublin",
          "location": {
            "latitude": 53.910278,
            "longitude": -8.818611
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
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
          "city": {
            "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
            "name": "Frankfurt"
          },
          "name": "Frankfurt Rhein/Main",
          "country": {
            "code": "DE",
            "name": "Germany"
          },
          "timezone": "Europe/Berlin",
          "location": {
            "latitude": 50.04693,
            "longitude": 8.57397
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
          "icaoCode": "EPWA",
          "iataCode": "WAW",
          "city": {
            "id": "ec2d2121-804b-4f8f-a9d7-991ebd8465e8",
            "name": "Warsaw"
          },
          "name": "Warsaw Chopin",
          "country": {
            "code": "PL",
            "name": "Poland"
          },
          "timezone": "Europe/Warsaw",
          "location": {
            "latitude": 52.16575,
            "longitude": 20.967123
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
          "icaoCode": "LFPG",
          "iataCode": "CDG",
          "city": {
            "id": "17c8f21f-b5a3-41f5-a1e3-16f4100c2342",
            "name": "Paris"
          },
          "name": "Paris Charles de Gaulle",
          "country": {
            "code": "FR",
            "name": "France"
          },
          "timezone": "Europe/Paris",
          "location": {
            "latitude": 49.00896,
            "longitude": 2.55412
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
          "icaoCode": "BIKF",
          "iataCode": "KEF",
          "city": {
            "id": "bb33c063-d0c3-4468-98ce-a048a78f409a",
            "name": "Reykjavik"
          },
          "name": "Reykjavik Keflavik",
          "country": {
            "code": "IS",
            "name": "Iceland"
          },
          "timezone": "Atlantic/Reykjavik",
          "location": {
            "latitude": 63.985,
            "longitude": -22.6056
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "5c88ea21-f482-47ff-8b1f-3d0c9bbd6caf",
          "icaoCode": "EDDW",
          "iataCode": "BRE",
          "city": {
            "id": "11fe7e0d-ef97-4a1d-9a87-8ad9da64fd91",
            "name": "Bremen"
          },
          "name": "Bremen",
          "country": {
            "code": "DE",
            "name": "Germany"
          },
          "timezone": "Europe/Berlin",
          "location": {
            "latitude": 53.0475,
            "longitude": 8.786667
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "93a9db1c-5047-489c-a018-178c3abd8a02",
          "icaoCode": "LFPO",
          "iataCode": "ORY",
          "city": {
            "id": "17c8f21f-b5a3-41f5-a1e3-16f4100c2342",
            "name": "Paris"
          },
          "name": "Paris Orly",
          "country": {
            "code": "FR",
            "name": "France"
          },
          "timezone": "Europe/Paris",
          "location": {
            "latitude": 48.7233,
            "longitude": 2.35944
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": null
        },
        {
          "id": "2f1c5a84-6d3b-4e77-9a12-8c5b3e9d4f60",
          "icaoCode": "EINN",
          "iataCode": "SNN",
          "city": {
            "id": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83",
            "name": "Shannon"
          },
          "name": "Shannon Intl",
          "country": {
            "code": "IE",
            "name": "Ireland"
          },
          "timezone": "Europe/Dublin",
          "location": {
            "latitude": 52.701978,
            "longitude": -8.924817
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
        },
        {
          "id": "c39d6f52-84a1-4b73-9e6c-1f8a3d7b5e29",
          "icaoCode": "EIKN",
          "iataCode": "NOC",
          "city": {
            "id": "b6e3a827-4d19-4f52-9c7a-3e8b5d1f6a94",
            "name": "Knock"
          },
          "name": "Ireland West Knock",
          "country": {
            "code": "IE",
            "name": "Ireland"
          },
          "timezone": "Europe/Dublin",
          "location": {
            "latitude": 53.910278,
            "longitude": -8.818611
          },
          "continent": "europe",
          "dataQuality": "low",
          "shape": "@coordinates"
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
            "continent must be one of the following values: africa, antarctica, asia, europe, north_america, oceania, south_america"
          ]
        }
      }
      """

  Scenario: As a cabin crew I can filter airports by data quality
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "dataQuality": "flagship"
      }
      """
    Then the response status should be 200
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport?dataQuality=flagship"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "icaoCode": "EDDF",
          "iataCode": "FRA",
          "city": {
            "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
            "name": "Frankfurt"
          },
          "name": "Frankfurt Rhein/Main",
          "country": {
            "code": "DE",
            "name": "Germany"
          },
          "timezone": "Europe/Berlin",
          "continent": "europe",
          "dataQuality": "flagship",
          "location": {
            "longitude": 8.57397,
            "latitude": 50.04693
          },
          "shape": "@coordinates"
        }
      ]
      """
    And I set database to initial state

  Scenario: As a cabin crew I see no airports when none has the requested data quality
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport?dataQuality=flagship"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: As a cabin crew I cannot filter airports by incorrect data quality
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport?dataQuality=perfect"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "dataQuality": ["dataQuality must be one of the following values: low, high, flagship"]
        }
      }
      """
