Feature: Read the seated passenger manifest of a flight

  Scenario: As operations I read the manifest of a flight already under way
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "a7cd765c-8dcf-40b6-99a5-dae4a5c974b6",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 24, "economy": 126 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And every entry of the response body list "passengers" should have a "name"
    And every entry of the response body list "passengers" should have a "pnr"
    And every entry of the response body list "passengers" should have a "cabin"
    And between 1 and 60 entries of the response body list "passengers" should have a "ssr"
    And every "ssr" of the response body list "passengers" should be one of "INFT,WCHR,WCHS,WCHC,UMNR,BLND,DEAF,MAAS,PETC"

  Scenario: As the captain I read the manifest of the flight I command
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "a7cd765c-8dcf-40b6-99a5-dae4a5c974b6",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 24, "economy": 126 },
        "passengers": "@any"
      }
      """
    And every entry of the response body list "passengers" should have a "designator"
    And every "ssr" of the response body list "passengers" should be one of "INFT,WCHR,WCHS,WCHC,UMNR,BLND,DEAF,MAAS,PETC"

  Scenario: As operations I list only the passengers who boarded
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/manifest?status=boarded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "f14a2141-4737-4622-a387-40513ff3baf1",
        "cabinLayout": "aa-77w",
        "cabinLayoutRevision": 1,
        "passengerCount": 292,
        "passengersByCabin": { "first": 7, "business": 49, "premium_economy": 26, "economy": 210 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values

  Scenario: As operations I list only the no-shows, each with the seat they were given
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/manifest?status=no_show"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "f14a2141-4737-4622-a387-40513ff3baf1",
        "cabinLayout": "aa-77w",
        "cabinLayoutRevision": 1,
        "passengerCount": 4,
        "passengersByCabin": { "business": 1, "premium_economy": 1, "economy": 2 },
        "passengers": "@any"
      }
      """
    And every entry of the response body list "passengers" should have a "designator"

  Scenario: As operations I read boarded passengers and no-shows together
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/f14a2141-4737-4622-a387-40513ff3baf1/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "f14a2141-4737-4622-a387-40513ff3baf1",
        "cabinLayout": "aa-77w",
        "cabinLayoutRevision": 1,
        "passengerCount": 296,
        "passengersByCabin": { "first": 7, "business": 50, "premium_economy": 27, "economy": 212 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And every entry of the response body list "passengers" should have a "status"

  Scenario: As operations I cannot filter on an unknown passenger status
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest?status=missing"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "statusCode": 400,
        "message": "Request validation failed.",
        "error": "Bad Request",
        "violations": {
          "status": ["status must be one of the following values: boarded, no_show"]
        }
      }
      """

  Scenario: As a cabin crew I cannot read the manifest of a flight I do not command
    Given I am signed in as "Alan Doe"
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "error": "Forbidden",
        "message": "Cabin crew can only read the manifest of a flight they captain."
      }
      """

  Scenario: As operations I read no manifest for a flight that has not been released
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/a5fffa17-7803-4e85-8291-d1dc9276bd46/manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight has no manifest yet. It is generated when the flight is released to the pilot."
      }
      """

  Scenario: As operations I read no manifest for a flight whose aircraft has no cabin layout
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/e847e79d-5ce7-4f54-9270-74f8fa4a57ea/manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Aircraft flying this flight has no cabin layout assigned, so the flight has no manifest."
      }
      """

  Scenario: As operations I cannot read the manifest of a flight that does not exist
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/db9b8707-c1a9-479a-9923-7caae3e8ea78/manifest"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Flight with given id does not exist."
      }
      """

  Scenario: As operations I cannot read the manifest of a flight with an incorrect uuid
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/not-a-uuid/manifest"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """

  Scenario: As an admin I cannot read a flight manifest
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot read a flight manifest
    When I send a "GET" request to "/api/v1/flight/a7cd765c-8dcf-40b6-99a5-dae4a5c974b6/manifest" with bearer token "invalid"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
