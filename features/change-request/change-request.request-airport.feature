Feature: Propose a change to an airport

  Scenario: As a cabin crew I can propose a new timezone and location for an airport
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "timezone": "Europe/Berlin",
        "location": {
          "latitude": 52.1672,
          "longitude": 20.9679
        }
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "airport",
        "targetId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "changes": {
          "timezone": "Europe/Berlin",
          "location": {
            "latitude": 52.1672,
            "longitude": 20.9679
          }
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
            "field": "timezone",
            "current": "Europe/Warsaw",
            "proposed": "Europe/Berlin"
          },
          {
            "field": "location",
            "current": {
              "latitude": 52.16575,
              "longitude": 20.967123
            },
            "proposed": {
              "latitude": 52.1672,
              "longitude": 20.9679
            }
          }
        ]
      }
      """
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "icaoCode": "EPWA",
        "iataCode": "WAW",
        "city": {
          "id": "ec2d2121-804b-4f8f-a9d7-991ebd8465e8",
          "name": "Warsaw"
        },
        "name": "Warsaw Chopin",
        "country": {
          "code": "PL",
          "name": "Poland"
        },
        "timezone": "Europe/Warsaw",
        "location": {
          "latitude": 52.16575,
          "longitude": 20.967123
        },
        "continent": "europe",
        "dataQuality": "low",
        "shape": "@coordinates"
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can propose moving an airport to another existing city
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/e764251b-bb25-4e8b-8cc7-11b0397b4554/request-data-change" with body:
      """json
      {
        "cityId": "6ef8953e-7c45-417a-b850-7e3c53de54cd"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "airport",
        "targetId": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
        "changes": {
          "cityId": "6ef8953e-7c45-417a-b850-7e3c53de54cd"
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
            "field": "cityId",
            "current": "e30d5e72-29ca-4f01-8e75-fdc55e3b296a",
            "proposed": "6ef8953e-7c45-417a-b850-7e3c53de54cd"
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I can propose a change to an airport that already has pending proposals
    Given I am signed in as "Alan Doe"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "continent": "asia"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "airport",
        "targetId": "616cbdd7-ccfc-4687-8cf6-1e7236435046",
        "changes": {
          "continent": "asia"
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
            "field": "continent",
            "current": "europe",
            "proposed": "asia"
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot propose a change that names no field
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
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

  Scenario: As a cabin crew I cannot propose invalid values
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "country": "XX",
        "location": {
          "latitude": 95,
          "longitude": 20.97
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
          "country": ["country must be a known ISO 3166-1 alpha-2 country code"],
          "location.latitude": ["latitude must not be greater than 90"]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose an empty name, city or location
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "name": null,
        "cityId": null,
        "location": null
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
          "name": ["name should not be empty", "name must be a string"],
          "cityId": ["cityId must be a UUID"],
          "location": ["location should not be empty", "nested property location must be either object or array"]
        }
      }
      """

  Scenario: As a cabin crew I can propose removing an airport shape
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/6cf1fcd8-d072-46b5-8132-bd885b43dd97/request-data-change" with body:
      """json
      {
        "shape": null
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "id": "@uuid",
        "resource": "airport",
        "targetId": "6cf1fcd8-d072-46b5-8132-bd885b43dd97",
        "changes": {
          "shape": null
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
            "field": "shape",
            "current": [
              { "latitude": 47.620606, "longitude": -52.779227 },
              { "latitude": 47.622187, "longitude": -52.779477 },
              { "latitude": 47.626312, "longitude": -52.771574 },
              { "latitude": 47.626607, "longitude": -52.7648 },
              { "latitude": 47.628939, "longitude": -52.758845 },
              { "latitude": 47.630924, "longitude": -52.755441 },
              { "latitude": 47.628507, "longitude": -52.746031 },
              { "latitude": 47.627425, "longitude": -52.740925 },
              { "latitude": 47.627728, "longitude": -52.740124 },
              { "latitude": 47.627973, "longitude": -52.737993 },
              { "latitude": 47.628387, "longitude": -52.738049 },
              { "latitude": 47.62848, "longitude": -52.736842 },
              { "latitude": 47.627197, "longitude": -52.736796 },
              { "latitude": 47.627846, "longitude": -52.724076 },
              { "latitude": 47.62468, "longitude": -52.724025 },
              { "latitude": 47.620856, "longitude": -52.72355 },
              { "latitude": 47.617539, "longitude": -52.732557 },
              { "latitude": 47.615522, "longitude": -52.733603 },
              { "latitude": 47.609632, "longitude": -52.72905 },
              { "latitude": 47.608912, "longitude": -52.731284 },
              { "latitude": 47.607847, "longitude": -52.732529 },
              { "latitude": 47.609109, "longitude": -52.733756 },
              { "latitude": 47.607745, "longitude": -52.739871 },
              { "latitude": 47.608726, "longitude": -52.741591 },
              { "latitude": 47.60965, "longitude": -52.741695 },
              { "latitude": 47.60929, "longitude": -52.742508 },
              { "latitude": 47.612637, "longitude": -52.748901 },
              { "latitude": 47.612632, "longitude": -52.749379 },
              { "latitude": 47.612029, "longitude": -52.749646 },
              { "latitude": 47.612121, "longitude": -52.749889 },
              { "latitude": 47.612597, "longitude": -52.750194 },
              { "latitude": 47.61486, "longitude": -52.753552 },
              { "latitude": 47.613637, "longitude": -52.756212 },
              { "latitude": 47.614889, "longitude": -52.757625 },
              { "latitude": 47.615796, "longitude": -52.756218 },
              { "latitude": 47.621206, "longitude": -52.766021 }
            ],
            "proposed": null
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot propose fields that are not open to proposals
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "dataQuality": "flagship"
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
          "dataQuality": ["property dataQuality should not exist"]
        }
      }
      """

  Scenario: As a cabin crew I cannot propose a change to an airport that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c/request-data-change" with body:
      """json
      {
        "name": "Nowhere"
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

  Scenario: As a cabin crew I cannot propose moving an airport to a city that does not exist
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "cityId": "0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "City with given id does not exist."
      }
      """

  Scenario: As a cabin crew I cannot propose values equal to the current ones
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "name": "Warsaw Chopin",
        "timezone": "Europe/Warsaw"
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

  Scenario: As an operations I cannot propose a change to an airport
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "name": "Warsaw Chopin Airport"
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

  Scenario: As an admin I cannot propose a change to an airport
    Given I am signed in as "admin"
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "name": "Warsaw Chopin Airport"
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

  Scenario: As an unauthorized user I cannot propose a change to an airport
    When I send a "POST" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/request-data-change" with body:
      """json
      {
        "name": "Warsaw Chopin Airport"
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
