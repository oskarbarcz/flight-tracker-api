Feature: Propose a change to a terminal

  Scenario: As a cabin crew I can propose a taxi time and operators for a terminal
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "averageTaxiTime": 16,
        "operatorCodes": ["BAW", "AFR", "UAE"]
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "terminal",
        "targetId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
        "target": {
          "label": "T2",
          "airport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main"
          }
        },
        "changes": {
          "averageTaxiTime": 16,
          "operatorCodes": ["BAW", "AFR", "UAE"]
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
            "field": "averageTaxiTime",
            "current": 14,
            "proposed": 16
          },
          {
            "field": "operatorCodes",
            "current": ["BAW", "AFR"],
            "proposed": ["BAW", "AFR", "UAE"]
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
        "airportId": "f35c094a-bec5-4803-be32-bd80a14b441a",
        "shortName": "T2",
        "fullName": "Terminal 2",
        "averageTaxiTime": 14,
        "operatorCodes": ["BAW", "AFR"],
        "text": null,
        "shape": [
          { "latitude": 50.051548, "longitude": 8.584653 },
          { "latitude": 50.05067, "longitude": 8.585164 },
          { "latitude": 50.050541, "longitude": 8.585736 },
          { "latitude": 50.051337, "longitude": 8.589068 },
          { "latitude": 50.051416, "longitude": 8.589282 },
          { "latitude": 50.051756, "longitude": 8.589721 },
          { "latitude": 50.052342, "longitude": 8.589382 },
          { "latitude": 50.052621, "longitude": 8.58913 },
          { "latitude": 50.052563, "longitude": 8.587294 },
          { "latitude": 50.052301, "longitude": 8.586179 }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can propose a footprint for a terminal
    Given I am signed in as "Alan Doe"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "shape": [
          { "latitude": 50.0515, "longitude": 8.5846 },
          { "latitude": 50.0526, "longitude": 8.5891 },
          { "latitude": 50.0505, "longitude": 8.5857 }
        ]
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "terminal",
        "targetId": "26106c8a-aaee-4b84-bb6c-b5af3389e22f",
        "target": {
          "label": "T2",
          "airport": {
            "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
            "icaoCode": "EDDF",
            "iataCode": "FRA",
            "name": "Frankfurt Rhein/Main"
          }
        },
        "changes": {
          "shape": [
            { "latitude": 50.0515, "longitude": 8.5846 },
            { "latitude": 50.0526, "longitude": 8.5891 },
            { "latitude": 50.0505, "longitude": 8.5857 }
          ]
        },
        "status": "pending",
        "requestedBy": {
          "id": "725f5df2-0c78-4fe8-89a2-52566c89cf7f",
          "name": "Alan Doe"
        },
        "decidedBy": null,
        "rejectionReason": null,
        "decidedAt": null,
        "createdAt": "@date('within 1 minute from now')",
        "fields": [
          {
            "field": "shape",
            "current": [
              { "latitude": 50.051548, "longitude": 8.584653 },
              { "latitude": 50.05067, "longitude": 8.585164 },
              { "latitude": 50.050541, "longitude": 8.585736 },
              { "latitude": 50.051337, "longitude": 8.589068 },
              { "latitude": 50.051416, "longitude": 8.589282 },
              { "latitude": 50.051756, "longitude": 8.589721 },
              { "latitude": 50.052342, "longitude": 8.589382 },
              { "latitude": 50.052621, "longitude": 8.58913 },
              { "latitude": 50.052563, "longitude": 8.587294 },
              { "latitude": 50.052301, "longitude": 8.586179 }
            ],
            "proposed": [
              { "latitude": 50.0515, "longitude": 8.5846 },
              { "latitude": 50.0526, "longitude": 8.5891 },
              { "latitude": 50.0505, "longitude": 8.5857 }
            ]
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot propose a terminal footprint with too few points
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "shape": [
          { "latitude": 50.0515, "longitude": 8.5846 },
          { "latitude": 50.0526, "longitude": 8.5891 }
        ]
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
          "shape": ["shape must contain at least 3 elements"]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose an empty taxi time for a terminal
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "averageTaxiTime": null
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
          "averageTaxiTime": ["averageTaxiTime must not be less than 0", "averageTaxiTime must be an integer number"]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose a change to a terminal through another airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "averageTaxiTime": 16
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Terminal with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot propose a change to a terminal of an airport that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "averageTaxiTime": 16
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

  Scenario: As a cabin crew I cannot propose another airport for a terminal
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
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

  Scenario: As a cabin crew I cannot propose a terminal change that names no field
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
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

  Scenario: As a cabin crew I cannot propose terminal values equal to the current ones
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "averageTaxiTime": 14,
        "text": null,
        "shape": [
          { "latitude": 50.051548, "longitude": 8.584653 },
          { "latitude": 50.05067, "longitude": 8.585164 },
          { "latitude": 50.050541, "longitude": 8.585736 },
          { "latitude": 50.051337, "longitude": 8.589068 },
          { "latitude": 50.051416, "longitude": 8.589282 },
          { "latitude": 50.051756, "longitude": 8.589721 },
          { "latitude": 50.052342, "longitude": 8.589382 },
          { "latitude": 50.052621, "longitude": 8.58913 },
          { "latitude": 50.052563, "longitude": 8.587294 },
          { "latitude": 50.052301, "longitude": 8.586179 }
        ]
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

  Scenario: As an operations I cannot propose a change to a terminal
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "averageTaxiTime": 16
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

  Scenario: As an admin I cannot propose a change to a terminal
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "averageTaxiTime": 16
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

  Scenario: As an unauthorized user I cannot propose a change to a terminal
    When I send a "POST" request to "/api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/terminal/26106c8a-aaee-4b84-bb6c-b5af3389e22f/request-data-change" with body:
      """json
      {
        "averageTaxiTime": 16
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
