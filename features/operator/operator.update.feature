Feature: Update operator resource

  Scenario: Update operator with correct data
    Given I use seed data
    When I send a "PATCH" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871" with body:
    """json
    {
      "shortName": "Condor Regional"
    }
    """
    Then the response status should be 200
    And the response body should contain:
    """json
    {
      "id": "5c649579-22eb-4c07-a96c-b74a77f53871",
      "icaoCode": "CDG",
      "shortName": "Condor Regional",
      "fullName": "Condor Flugdienst",
      "callsign": "CONDOR"
    }
    """

  Scenario: Update operator with incorrect data
    Given I use seed data
    When I send a "PATCH" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871" with body:
    """json
    {
      "id": "9f5da1a4-f09e-4961-8299-82d688337d1f",
      "shortName": "Condor Regional",
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

  Scenario: Update operator that does not exist
    Given I use seed data
    When I send a "PATCH" request to "/api/v1/operator/4a13da08-1188-44bf-a5dd-7cb474e6017d"
    Then the response status should be 404
    And the response body should contain:
    """json
    {
      "message": "Operator with given id does not exist.",
      "error": "Not Found",
      "statusCode": 404
    }
    """

  Scenario: Update operator with incorrect uuid
    When I send a "PATCH" request to "/api/v1/operator/incorrect-uuid"
    Then the response status should be 400
    And the response body should contain:
    """json
    {
      "message": "Validation failed (uuid v 4 is expected)",
      "error": "Bad Request",
      "statusCode": 400
    }
    """