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
        "city": "Frankfurt",
        "name": "Frankfurt Rhein/Main",
        "country": "Germany",
        "timezone": "Europe/Berlin"
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
        "city": "Frankfurt",
        "name": "Frankfurt Rhein/Main",
        "country": "Germany",
        "timezone": "Europe/Berlin"
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
        "city": "Frankfurt",
        "name": "Frankfurt Rhein/Main",
        "country": "Germany",
        "timezone": "Europe/Berlin"
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

  Scenario: As an unauthorized user I cannot get one airport
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
