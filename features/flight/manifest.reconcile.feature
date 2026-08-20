Feature: Reconcile the passenger manifest when boarding finishes

  Scenario: A lower final count records the surplus as no-shows
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 140,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=boarded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 140,
        "passengersByCabin": { "business": 22, "economy": 118 },
        "passengers": "@any"
      }
      """
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=no_show"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 10,
        "passengersByCabin": { "business": 2, "economy": 8 },
        "passengers": "@any"
      }
      """
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 24, "economy": 126 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And I set database to initial state

  Scenario: A higher final count seats new passengers in free seats
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 170,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=boarded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 170,
        "passengersByCabin": { "business": 27, "economy": 143 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And every entry of the response body list "passengers" should have a "name"
    And every entry of the response body list "passengers" should have a "pnr"
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=no_show"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 0,
        "passengersByCabin": {},
        "passengers": "@any"
      }
      """
    And I set database to initial state

  Scenario: An unchanged final count leaves the manifest alone
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=boarded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 24, "economy": 126 },
        "passengers": "@any"
      }
      """
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=no_show"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 0,
        "passengersByCabin": {},
        "passengers": "@any"
      }
      """
    And I set database to initial state

  Scenario: A shift between cabins empties one and fills the other
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4,
        "passengersByCabin": { "business": 18, "economy": 132 }
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=boarded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 150,
        "passengersByCabin": { "business": 18, "economy": 132 },
        "passengers": "@any"
      }
      """
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=no_show"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 6,
        "passengersByCabin": { "business": 6 },
        "passengers": "@any"
      }
      """
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 156,
        "passengersByCabin": { "business": 24, "economy": 132 },
        "passengers": "@any"
      }
      """
    And the response body list "passengers" should have distinct "designator" values
    And I set database to initial state

  Scenario: A final count above the cabin's capacity does not finish boarding
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 221,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot seat 221 passengers in a cabin of 220 seats."
      }
      """
    When I send a "POST" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 140,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=boarded"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "flightId": "92abe9b3-0986-4dc2-9d93-50eadaa73e70",
        "cabinLayout": "de-321",
        "cabinLayoutRevision": 1,
        "passengerCount": 140,
        "passengersByCabin": { "business": 22, "economy": 118 },
        "passengers": "@any"
      }
      """
    And I set database to initial state

  Scenario: A final breakdown that does not sum to the total is refused
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4,
        "passengersByCabin": { "business": 18, "economy": 130 }
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Passenger breakdown must sum to the total passenger count."
      }
      """
    And I set database to initial state

  Scenario: A final breakdown naming a cabin the aircraft does not have is refused
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4,
        "passengersByCabin": { "first": 10, "business": 20, "economy": 120 }
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cabin \"first\" does not exist in the cabin of this flight."
      }
      """
    And I set database to initial state

  Scenario: A final breakdown above one cabin's capacity is refused
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 150,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4,
        "passengersByCabin": { "business": 40, "economy": 110 }
      }
      """
    Then the response status should be 422
    And the response body should contain:
      """json
      {
        "statusCode": 422,
        "error": "Unprocessable Content",
        "message": "Cannot seat 40 passengers in cabin \"business\", which has 36 seats."
      }
      """
    And I set database to initial state

  Scenario: A flight without a cabin layout finishes boarding without a manifest
    Given I am signed in as "cabin crew"
    When I send a "POST" request to "/api/v1/flight/e847e79d-5ce7-4f54-9270-74f8fa4a57ea/finish-boarding" with body:
      """json
      {
        "flightCrew": {
          "pilots": 2,
          "reliefPilots": 0,
          "cabinCrew": 5
        },
        "passengers": 140,
        "payload": 19.8,
        "cargo": 4.2,
        "zeroFuelWeight": 68.4,
        "blockFuel": 21.4
      }
      """
    Then the response status should be 204
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
    And I set database to initial state

  Scenario: An unknown passenger status cannot be filtered on
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/flight/92abe9b3-0986-4dc2-9d93-50eadaa73e70/manifest?status=missing"
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
