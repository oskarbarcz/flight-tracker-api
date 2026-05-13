Feature: Create runway

  Scenario: As an admin I cannot create runway
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway" with body:
      """json
      {
        "designator": "05",
        "length": 2000,
        "width": 45,
        "magneticHeading": 47,
        "surfaceType": "asphalt",
        "lightingType": "MIRL"
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

  Scenario: As operations I can create runway with minimum fields
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway" with body:
      """json
      {
        "designator": "05",
        "length": 2000,
        "width": 45,
        "magneticHeading": 47,
        "surfaceType": "asphalt",
        "lightingType": "MIRL"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "designator": "05",
        "length": 2000,
        "width": 45,
        "displace": null,
        "trueHeading": null,
        "magneticHeading": 47,
        "elevation": null,
        "surfaceType": "asphalt",
        "lightingType": "MIRL"
      }
      """
    And I set database to initial state

  Scenario: As operations I can create runway with all fields
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway" with body:
      """json
      {
        "designator": "23L",
        "length": 3500,
        "width": 60,
        "displace": 200,
        "trueHeading": 231,
        "magneticHeading": 227,
        "elevation": 110,
        "surfaceType": "concrete",
        "lightingType": "ALS"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "designator": "23L",
        "length": 3500,
        "width": 60,
        "displace": 200,
        "trueHeading": 231,
        "magneticHeading": 227,
        "elevation": 110,
        "surfaceType": "concrete",
        "lightingType": "ALS"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot create runway
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway" with body:
      """json
      {
        "designator": "05",
        "length": 2000,
        "width": 45,
        "magneticHeading": 47,
        "surfaceType": "asphalt",
        "lightingType": "MIRL"
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

  Scenario: As operations I cannot create runway at non-existing airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/b19547a8-393d-46d3-8fae-aef51e8c860d/runway" with body:
      """json
      {
        "designator": "05",
        "length": 2000,
        "width": 45,
        "magneticHeading": 47,
        "surfaceType": "asphalt",
        "lightingType": "MIRL"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Airport with given id does not exist.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

  Scenario: As operations I cannot create runway with invalid designator
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway" with body:
      """json
      {
        "designator": "99X",
        "length": 2000,
        "width": 45,
        "magneticHeading": 47,
        "surfaceType": "asphalt",
        "lightingType": "MIRL"
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
          "designator": ["designator must be a runway end designator (01-36 with optional L/C/R suffix)"]
        }
      }
      """

  Scenario: As operations I cannot create runway with invalid magnetic heading
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway" with body:
      """json
      {
        "designator": "05",
        "length": 2000,
        "width": 45,
        "magneticHeading": 540,
        "surfaceType": "asphalt",
        "lightingType": "MIRL"
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
          "magneticHeading": ["magneticHeading must not be greater than 359"]
        }
      }
      """

  Scenario: As an unauthorized user I cannot create runway
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway" with body:
      """json
      {
        "designator": "05",
        "length": 2000,
        "width": 45,
        "magneticHeading": 47,
        "surfaceType": "asphalt",
        "lightingType": "MIRL"
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
