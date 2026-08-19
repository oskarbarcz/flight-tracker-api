Feature: Assign a cabin layout to an aircraft

  Scenario: As operations I can assign a cabin layout to an aircraft that has none
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/aircraft/6c48d613-6582-49de-afbb-89fdc7cac0b7/cabin-layout" with body:
      """json
      {
        "cabinLayout": "aa-77w"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "6c48d613-6582-49de-afbb-89fdc7cac0b7",
        "airframe": {
          "type": "B77W",
          "iataType": "77W",
          "name": "Boeing 777-300ER",
          "cruiseSpeed": { "value": 0.84, "unit": "mach" },
          "serviceCeiling": 43000,
          "performanceCode": "D",
          "weightCategory": "heavy",
          "serviceType": "passenger"
        },
        "registration": "N718AN",
        "selcal": "AB-CD",
        "livery": "Oneworld (2023)",
        "currentState": "idle",
        "etopsThresholdMinutes": null,
        "cabinLayout": {
          "id": "aa-77w",
          "airlineIata": "AA",
          "aircraftIata": "77W",
          "variant": null,
          "revision": null,
          "retired": false,
          "mismatched": false
        },
        "baseAirport": {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "iataCode": "JFK",
          "name": "New York JFK",
          "city": "New York",
          "country": "United States of America",
          "location": "@coordinates"
        },
        "lastAirport": {
          "id": "e764251b-bb25-4e8b-8cc7-11b0397b4554",
          "iataCode": "PHL",
          "name": "Philadelphia Intl",
          "city": "Philadelphia",
          "country": "United States of America",
          "location": "@coordinates"
        },
        "lastAirportUpdatedAt": "2025-01-01T16:18:00.000Z",
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: As operations I can replace the cabin layout of an aircraft
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/aircraft/a10c21e3-3ac1-4265-9d12-da9baefa2d98/cabin-layout" with body:
      """json
      {
        "cabinLayout": "aa-77w-2"
      }
      """
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "a10c21e3-3ac1-4265-9d12-da9baefa2d98",
        "airframe": {
          "type": "B77W",
          "iataType": "77W",
          "name": "Boeing 777-300ER",
          "cruiseSpeed": { "value": 0.84, "unit": "mach" },
          "serviceCeiling": 43000,
          "performanceCode": "D",
          "weightCategory": "heavy",
          "serviceType": "passenger"
        },
        "registration": "N78881",
        "selcal": "KY-JO",
        "livery": "Team USA (2023)",
        "currentState": "cruise",
        "etopsThresholdMinutes": 180,
        "cabinLayout": {
          "id": "aa-77w-2",
          "airlineIata": "AA",
          "aircraftIata": "77W",
          "variant": "2",
          "revision": null,
          "retired": false,
          "mismatched": false
        },
        "baseAirport": {
          "id": "3c721cc6-c653-4fad-be43-dc9d6a149383",
          "iataCode": "JFK",
          "name": "New York JFK",
          "city": "New York",
          "country": "United States of America",
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
        "lastAirportUpdatedAt": "2025-01-01T08:00:00.000Z",
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: As operations I can remove the cabin layout of an aircraft
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout"
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "5f8902a2-f2b2-46e9-8630-365f78ee6ff3",
        "airframe": {
          "type": "B738",
          "iataType": "738",
          "name": "Boeing 737-800",
          "cruiseSpeed": { "value": 0.78, "unit": "mach" },
          "serviceCeiling": 41000,
          "performanceCode": "C",
          "weightCategory": "medium",
          "serviceType": "passenger"
        },
        "registration": "PH-BXA",
        "selcal": "KL-BX",
        "livery": "KLM (2022)",
        "currentState": "planned",
        "etopsThresholdMinutes": null,
        "cabinLayout": null,
        "baseAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirport": null,
        "lastAirportUpdatedAt": null,
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: As operations I can assign a layout drawn for another airline
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/3a1354c5-d9fb-428b-9f87-0e887e491f0d/aircraft/54ae8e50-8712-40be-b4af-d22633b0956f/cabin-layout" with body:
      """json
      {
        "cabinLayout": "aa-77w"
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
        "cabinLayout": {
          "id": "aa-77w",
          "airlineIata": "AA",
          "aircraftIata": "77W",
          "variant": null,
          "revision": null,
          "retired": false,
          "mismatched": true
        },
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

  Scenario: As operations I cannot assign a layout that is not catalogued
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/3a1354c5-d9fb-428b-9f87-0e887e491f0d/aircraft/54ae8e50-8712-40be-b4af-d22633b0956f/cabin-layout" with body:
      """json
      {
        "cabinLayout": "zz-999"
      }
      """
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Cabin layout zz-999 does not exist."
      }
      """

  Scenario: As operations I cannot assign a cabin layout to an aircraft that does not exist
    Given I am signed in as "operations"
    When I send a "PUT" request to "/api/v1/operator/3a1354c5-d9fb-428b-9f87-0e887e491f0d/aircraft/d2a4c2bf-2004-4697-a86a-a1dc62fbad55/cabin-layout" with body:
      """json
      {
        "cabinLayout": "aa-77w"
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

  Scenario: As operations I see a layout AeroLOPA has withdrawn reported as retired
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/e4ba1445-b413-49a9-b0c5-c8bd3df14b42/aircraft/fa413d0a-09f9-4864-9ee6-a5a008764765"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "fa413d0a-09f9-4864-9ee6-a5a008764765",
        "airframe": {
          "type": "B752",
          "iataType": "752",
          "name": "Boeing 757-200",
          "cruiseSpeed": { "value": 0.8, "unit": "mach" },
          "serviceCeiling": 42000,
          "performanceCode": "C",
          "weightCategory": "heavy",
          "serviceType": "passenger"
        },
        "registration": "TF-FIA",
        "selcal": "FI-AB",
        "livery": "Icelandair (2023)",
        "currentState": "planned",
        "etopsThresholdMinutes": 180,
        "cabinLayout": {
          "id": "fi-752-1",
          "airlineIata": "FI",
          "aircraftIata": "752",
          "variant": "1",
          "revision": null,
          "retired": true,
          "mismatched": false
        },
        "baseAirport": {
          "id": "523b2d2f-9b60-405a-bd5a-90eed1b58e9a",
          "iataCode": "KEF",
          "name": "Reykjavik Keflavik",
          "city": "Reykjavik",
          "country": "Iceland",
          "location": "@coordinates"
        },
        "lastAirport": null,
        "lastAirportUpdatedAt": null,
        "lastParkingPosition": null
      }
      """

  Scenario: As operations I see the aircraft follow the newest stored revision
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/cabin-layout/kl-738/seat-map"
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "id": "5f8902a2-f2b2-46e9-8630-365f78ee6ff3",
        "airframe": {
          "type": "B738",
          "iataType": "738",
          "name": "Boeing 737-800",
          "cruiseSpeed": { "value": 0.78, "unit": "mach" },
          "serviceCeiling": 41000,
          "performanceCode": "C",
          "weightCategory": "medium",
          "serviceType": "passenger"
        },
        "registration": "PH-BXA",
        "selcal": "KL-BX",
        "livery": "KLM (2022)",
        "currentState": "planned",
        "etopsThresholdMinutes": null,
        "cabinLayout": {
          "id": "kl-738",
          "airlineIata": "KL",
          "aircraftIata": "738",
          "variant": null,
          "revision": 1,
          "retired": false,
          "mismatched": false
        },
        "baseAirport": {
          "id": "f35c094a-bec5-4803-be32-bd80a14b441a",
          "iataCode": "FRA",
          "name": "Frankfurt Rhein/Main",
          "city": "Frankfurt",
          "country": "Germany",
          "location": "@coordinates"
        },
        "lastAirport": null,
        "lastAirportUpdatedAt": null,
        "lastParkingPosition": null
      }
      """
    And I set database to initial state

  Scenario: As operations I get the layouts of my airline and aircraft type suggested first
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/1f630d38-ad24-47cc-950b-3783e71bbd10/aircraft/a10c21e3-3ac1-4265-9d12-da9baefa2d98/cabin-layout/suggestions"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "items": [
          {
            "id": "aa-77w",
            "airlineIata": "AA",
            "aircraftIata": "77W",
            "variant": null,
            "sourceSlugs": ["aa-77w"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": null,
            "match": "exact"
          },
          {
            "id": "aa-77w-2",
            "airlineIata": "AA",
            "aircraftIata": "77W",
            "variant": "2",
            "sourceSlugs": ["aa-77w-2"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": null,
            "match": "exact"
          },
          {
            "id": "kl-77w",
            "airlineIata": "KL",
            "aircraftIata": "77W",
            "variant": null,
            "sourceSlugs": ["kl-77w"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": null,
            "match": "aircraft_type"
          }
        ],
        "total": 3
      }
      """

  Scenario: As operations I get the airline's other layouts suggested below the exact match
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout/suggestions"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "items": [
          {
            "id": "kl-738",
            "airlineIata": "KL",
            "aircraftIata": "738",
            "variant": null,
            "sourceSlugs": ["kl-738"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": null,
            "match": "exact"
          },
          {
            "id": "kl-77w",
            "airlineIata": "KL",
            "aircraftIata": "77W",
            "variant": null,
            "sourceSlugs": ["kl-77w"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": null,
            "match": "airline"
          }
        ],
        "total": 2
      }
      """

  Scenario: As operations I get a retired layout suggested, marked as retired
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/e4ba1445-b413-49a9-b0c5-c8bd3df14b42/aircraft/fa413d0a-09f9-4864-9ee6-a5a008764765/cabin-layout/suggestions"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "items": [
          {
            "id": "fi-752-1",
            "airlineIata": "FI",
            "aircraftIata": "752",
            "variant": "1",
            "sourceSlugs": ["fi-752-1"],
            "firstSeenAt": "2026-08-01T09:00:00.000Z",
            "retiredAt": "2026-08-12T09:00:00.000Z",
            "match": "exact"
          }
        ],
        "total": 1
      }
      """

  Scenario: As operations I get no suggestions for an aircraft the catalogue does not cover
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/operator/3a1354c5-d9fb-428b-9f87-0e887e491f0d/aircraft/54ae8e50-8712-40be-b4af-d22633b0956f/cabin-layout/suggestions"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "items": [],
        "total": 0
      }
      """

  Scenario: As an admin I cannot assign a cabin layout
    Given I am signed in as "admin"
    When I send a "PUT" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout" with body:
      """json
      {
        "cabinLayout": "kl-77w"
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

  Scenario: As a cabin crew I cannot assign a cabin layout
    Given I am signed in as "cabin crew"
    When I send a "PUT" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout" with body:
      """json
      {
        "cabinLayout": "kl-77w"
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

  Scenario: As an unauthorized user I cannot assign a cabin layout
    When I send a "PUT" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout" with bearer token "invalid"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: As an admin I cannot remove a cabin layout
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I cannot remove a cabin layout
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot remove a cabin layout
    When I send a "DELETE" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout" with bearer token "invalid"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """

  Scenario: As an admin I cannot get cabin layout suggestions
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout/suggestions"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I cannot get cabin layout suggestions
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout/suggestions"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot get cabin layout suggestions
    When I send a "GET" request to "/api/v1/operator/7d724b05-8eb9-4e66-84cc-bb101369d1a0/aircraft/5f8902a2-f2b2-46e9-8630-365f78ee6ff3/cabin-layout/suggestions" with bearer token "invalid"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
