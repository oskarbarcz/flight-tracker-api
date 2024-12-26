Feature: Update airport

  Scenario: As an admin I cannot update airport with correct data
    Given I use seed data
    And I am signed in as "admin"
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
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As an cabin crew I cannot update airport with correct data
    Given I use seed data
    And I am signed in as "cabin crew"
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
    Given I use seed data
    And I am signed in as "operations"
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

  Scenario: As operations I cannot update airport that does not exist
    Given I use seed data
    And I am signed in as "operations"
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
    Given I use seed data
    And I am signed in as "operations"
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
    Given I use seed data
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
