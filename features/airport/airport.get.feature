Feature: Get airport resource

  Scenario: Get one airport
    Given I use seed data
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a"
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
      "icaoCode": "EDDF",
      "name": "Frankfurt Rhein/Main",
      "country": "Germany",
      "timezone": "Europe/Berlin"
    }
    """

  Scenario: Get airport that does not exist
    Given I use seed data
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

  Scenario: Get airport with incorrect uuid
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
