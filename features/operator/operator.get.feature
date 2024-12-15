Feature: Get operator resource

  Scenario: Get one operator
    Given I use seed data
    When I send a "GET" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871"
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "5c649579-22eb-4c07-a96c-b74a77f53871",
      "icaoCode": "CDG",
      "shortName": "Condor",
      "fullName": "Condor Flugdienst",
      "callsign": "CONDOR"
    }
    """

  Scenario: Get operator that does not exist
    Given I use seed data
    When I send a "GET" request to "/api/v1/operator/9e64328a-27f0-4171-ba71-b64c86b494ea"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Operator with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Get operator with incorrect uuid
    When I send a "GET" request to "/api/v1/operator/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """
