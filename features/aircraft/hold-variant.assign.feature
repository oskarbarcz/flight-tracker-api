Feature: Assign a cargo hold variant to an aircraft

  Scenario: As operations I can assign a hold variant the aircraft type offers
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/hold-variant" with body:
      """json
      {
        "holdVariant": "a321-cls"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "7d27a031-5abb-415f-bde5-1aa563ad394e",
        "airframe": {
          "type": "A321",
          "iataType": "321",
          "name": "Airbus A321-200",
          "cruiseSpeed": { "value": 0.78, "unit": "mach" },
          "serviceCeiling": 39000,
          "performanceCode": "C",
          "weightCategory": "medium",
          "serviceType": "passenger"
        },
        "registration": "D-AIDA",
        "selcal": "SK-PK",
        "livery": "Sunshine (2024)",
        "currentState": "checked_in",
        "etopsThresholdMinutes": null,
        "cabinLayout": {
          "id": "de-321",
          "airlineIata": "DE",
          "aircraftIata": "321",
          "variant": null,
          "revision": 1,
          "retired": false,
          "mismatched": false
        },
        "holdVariant": "a321-cls",
        "baseAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirport": {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "iataCode": "JFK",
          "name": "New York JFK",
          "city": "New York",
          "country": "United States of America",
          "location": "@coordinates"
        },
        "lastAirportUpdatedAt": "2025-01-02T18:00:00.000Z",
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: As operations I can remove a hold variant, returning the aircraft to its type default
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/3a1354c5-d9fb-428b-9f87-0e887e491f0d/aircraft/54ae8e50-8712-40be-b4af-d22633b0956f/hold-variant"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "54ae8e50-8712-40be-b4af-d22633b0956f",
        "airframe": {
          "type": "A320",
          "iataType": "320",
          "name": "Airbus A320-200",
          "cruiseSpeed": { "value": 0.78, "unit": "mach" },
          "serviceCeiling": 39000,
          "performanceCode": "C",
          "weightCategory": "medium",
          "serviceType": "passenger"
        },
        "registration": "F-GKXA",
        "selcal": "AF-KX",
        "livery": "Air France (2021)",
        "currentState": "planned",
        "etopsThresholdMinutes": null,
        "cabinLayout": null,
        "holdVariant": null,
        "baseAirport": {
          "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
          "iataCode": "CDG",
          "name": "Paris Charles de Gaulle",
          "city": "Paris",
          "country": "France",
          "location": "@coordinates"
        },
        "lastAirport": null,
        "lastAirportUpdatedAt": null,
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: As operations I can reassign the variant an aircraft already carries
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/3a1354c5-d9fb-428b-9f87-0e887e491f0d/aircraft/54ae8e50-8712-40be-b4af-d22633b0956f/hold-variant" with body:
      """json
      {
        "holdVariant": "a320-bulk"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "54ae8e50-8712-40be-b4af-d22633b0956f",
        "airframe": {
          "type": "A320",
          "iataType": "320",
          "name": "Airbus A320-200",
          "cruiseSpeed": { "value": 0.78, "unit": "mach" },
          "serviceCeiling": 39000,
          "performanceCode": "C",
          "weightCategory": "medium",
          "serviceType": "passenger"
        },
        "registration": "F-GKXA",
        "selcal": "AF-KX",
        "livery": "Air France (2021)",
        "currentState": "planned",
        "etopsThresholdMinutes": null,
        "cabinLayout": null,
        "holdVariant": "a320-bulk",
        "baseAirport": {
          "id": "79b8f884-f67d-4585-b540-36b0be7f551e",
          "iataCode": "CDG",
          "name": "Paris Charles de Gaulle",
          "city": "Paris",
          "country": "France",
          "location": "@coordinates"
        },
        "lastAirport": null,
        "lastAirportUpdatedAt": null,
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: Assigning a variant the aircraft type does not offer returns 404
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/hold-variant" with body:
      """json
      {
        "holdVariant": "a320-cls"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Airframe type B738 does not offer hold variant a320-cls."
      }
      """

  Scenario: Assigning a hold variant to an unknown aircraft returns 404
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/00000000-0000-4000-8000-000000000000/hold-variant" with body:
      """json
      {
        "holdVariant": "a321-cls"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Aircraft with given ID not found."
      }
      """

  Scenario: Assigning a hold variant with an empty body returns 400
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/hold-variant" with body:
      """json
      {}
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "holdVariant": [
            "holdVariant must be longer than or equal to 2 characters",
            "holdVariant should not be empty",
            "holdVariant must be a string"
          ]
        }
      }
      """

  Scenario: As cabin crew I cannot assign a hold variant
    Given I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/hold-variant" with body:
      """json
      {
        "holdVariant": "a321-cls"
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

  Scenario: As cabin crew I cannot remove a hold variant
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/operator/3a1354c5-d9fb-428b-9f87-0e887e491f0d/aircraft/54ae8e50-8712-40be-b4af-d22633b0956f/hold-variant"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot assign a hold variant
    When I send a "PUT" request to "/api/v1/operator/5c649579-22eb-4c07-a96c-b74a77f53871/aircraft/7d27a031-5abb-415f-bde5-1aa563ad394e/hold-variant" with body:
      """json
      {
        "holdVariant": "a321-cls"
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

  Scenario: As an unauthorized user I cannot remove a hold variant
    When I send a "DELETE" request to "/api/v1/operator/3a1354c5-d9fb-428b-9f87-0e887e491f0d/aircraft/54ae8e50-8712-40be-b4af-d22633b0956f/hold-variant"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
