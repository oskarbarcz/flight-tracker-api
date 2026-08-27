Feature: Update airport

  Scenario: As an admin I cannot update airport with correct data
    Given I am signed in as "admin"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "name": "Frankfurt am Main"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot update airport with correct data
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "name": "Frankfurt am Main"
      }
      """
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
        "name": "Frankfurt am Main",
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
    And I set database to initial state

  Scenario: As operations renaming the city of its only airport renames the city itself
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "city": "Frankfurt am Main"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "icaoCode": "EDDF",
        "iataCode": "FRA",
        "city": {
          "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
          "name": "Frankfurt am Main"
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
    And I set database to initial state

  Scenario: As operations renaming the city of one airport of two leaves the other airport alone
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/79b8f884-f67d-4585-b540-36b0be7f551e" with body:
      """json
      {
        "city": "Roissy"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
        "icaoCode": "LFPG",
        "iataCode": "CDG",
        "city": {
          "id": "@uuid",
          "name": "Roissy"
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
    And I set database to initial state

  Scenario: As an cabin crew I cannot update airport with correct data
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "name": "Frankfurt am Main"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As operations I cannot update airport with incorrect data
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
        "country": "FR",
        "unrecognized-field": "A339"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "id": ["property id should not exist"],
          "unrecognized-field": ["property unrecognized-field should not exist"]
        }
      }
      """

  Scenario: As operations I cannot update airport that does not exist
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/d02c2edf-0365-4d68-a027-ecacfb1fb605"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot update airport with incorrect uuid
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an unauthorized user I cannot update airport
    When I send a "POST" request to "/api/v1/airport" with body:
      """json
      {
        "name": "Miami New Intl"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: As operations I can raise the data quality of an airport
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "dataQuality": "high"
      }
      """
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
        "dataQuality": "high",
        "location": {
          "longitude": 8.57397,
          "latitude": 50.04693
        },
        "shape": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: As operations I cannot set an unknown data quality
    Given I am signed in as "operations"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "dataQuality": "perfect"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "dataQuality": ["dataQuality must be one of the following values: low, high, flagship"]
        }
      }
      """

  Scenario: As a cabin crew I cannot change the data quality of an airport
    Given I am signed in as "cabin crew"
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "dataQuality": "flagship"
      }
      """
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot change the data quality of an airport
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
      """json
      {
        "dataQuality": "flagship"
      }
      """
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
