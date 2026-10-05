Feature: Propose a change to a runway

  Scenario: As a cabin crew I can propose a lighting type and magnetic heading for a runway
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "lightingType": "ALS",
        "magneticHeading": 73
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "runway",
        "targetId": "32121288-2550-4b81-a558-9a7193ef6c97",
        "changes": {
          "lightingType": "ALS",
          "magneticHeading": 73
        },
        "status": "pending",
        "requestedBy": {
          "id": "fcf6f4bc-290d-43a9-843c-409cd47e143d",
          "name": "Rick Doe"
        },
        "decidedBy": null,
        "rejectionReason": null,
        "decidedAt": null,
        "createdAt": "@date('within 1 minute from now')",
        "fields": [
          {
            "field": "magneticHeading",
            "current": 72,
            "proposed": 73
          },
          {
            "field": "lightingType",
            "current": "HIRL",
            "proposed": "ALS"
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "32121288-2550-4b81-a558-9a7193ef6c97",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "designator": "07C",
        "length": 4000,
        "width": 60,
        "displace": null,
        "trueHeading": 70,
        "magneticHeading": 72,
        "elevation": 111,
        "surfaceType": "asphalt",
        "lightingType": "HIRL",
        "coordinates": {
          "latitude": 50.0326,
          "longitude": 8.53463
        }
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot propose an invalid runway designator
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "designator": "37"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "designator": ["designator must be a runway end designator (01-36 with optional L/C/R suffix)"]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose malformed runway threshold coordinates
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "coordinates": {
          "latitude": "north",
          "longitude": 8.53463
        }
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "coordinates.latitude": [
            "latitude must not be greater than 90",
            "latitude must not be less than -90",
            "latitude must be a number conforming to the specified constraints"
          ]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose an empty runway length
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "length": null
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "length": ["length must not be less than 1", "length must be an integer number"]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose a change to a runway through another airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "lightingType": "ALS"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Runway with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot propose a change to a runway of an airport that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "lightingType": "ALS"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Airport with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot propose another airport for a runway
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "airportId": "616cbdd7-ccfc-4687-8cf6-1e7236435046"
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "airportId": ["property airportId should not exist"]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose a runway change that names no field
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {}
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "error": "Bad Request",
        "message": "A change request must propose at least one field."
      }
      """

  Scenario: As a cabin crew I cannot propose runway values equal to the current ones
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "lightingType": "HIRL",
        "displace": null,
        "coordinates": {
          "latitude": 50.0326,
          "longitude": 8.53463
        }
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Every proposed value is equal to the value held now."
      }
      """

  Scenario: As an operations I cannot propose a change to a runway
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "lightingType": "ALS"
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

  Scenario: As an admin I cannot propose a change to a runway
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "lightingType": "ALS"
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

  Scenario: As an unauthorized user I cannot propose a change to a runway
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/runway/32121288-2550-4b81-a558-9a7193ef6c97/request-data-change" with body:
      """json
      {
        "lightingType": "ALS"
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
