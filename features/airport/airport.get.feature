Feature: Get airport

  Scenario: As an admin I can get one airport
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a"
    Then the response status should be 200
    And the response body should contain:
      """json
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
        "dataQuality": "low",
        "location": {
          "longitude": 8.57397,
          "latitude": 50.04693
        },
        "shape": "@coordinates"
      }
      """

  Scenario: As operations I can get one airport
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a"
    Then the response status should be 200
    And the response body should contain:
      """json
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
        "dataQuality": "low",
        "location": {
          "longitude": 8.57397,
          "latitude": 50.04693
        },
        "shape": "@coordinates"
      }
      """

  Scenario: As a cabin crew I can get one airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a"
    Then the response status should be 200
    And the response body should contain:
      """json
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
        "dataQuality": "low",
        "location": {
          "longitude": 8.57397,
          "latitude": 50.04693
        },
        "shape": "@coordinates"
      }
      """

  Scenario: As a cabin crew I cannot get airport that does not exist
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As a cabin crew I cannot get airport with incorrect uuid
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As operations the second airport of a city reports that same city
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/93a9db1c-5047-489c-a018-178c3abd8a02"
    Then the response status should be 200
    And the response body should contain:
      """json
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
        "continent": "europe",
        "dataQuality": "low",
        "location": {
          "longitude": 2.35944,
          "latitude": 48.7233
        },
        "shape": null
      }
      """

  Scenario: As operations the first airport of that city reports the same city
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/79b8f884-f67d-4585-b540-36b0be7f551e"
    Then the response status should be 200
    And the response body should contain:
      """json
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
        "continent": "europe",
        "dataQuality": "low",
        "location": {
          "longitude": 2.55412,
          "latitude": 49.00896
        },
        "shape": "@coordinates"
      }
      """
