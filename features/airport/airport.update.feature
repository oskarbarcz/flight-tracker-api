Feature: Update airport resource

  Scenario: Update airport with correct data
    Given I use seed data
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
      "name": "Frankfurt am Main",
      "country": "Germany",
      "timezone": "Europe/Berlin"
    }
    """

  Scenario: Update airport with incorrect data
    Given I use seed data
    When I send a "PATCH" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a" with body:
    """json
    {
      "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
      "country": "France",
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
        "id": [
          "property id should not exist"
        ],
        "unrecognized-field": [
          "property unrecognized-field should not exist"
        ]
      }
    }
    """

  Scenario: Update airport that does not exist
    Given I use seed data
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

  Scenario: Update airport with incorrect uuid
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
