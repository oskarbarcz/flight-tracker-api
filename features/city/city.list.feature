Feature: Get every city an airport serves

  Scenario: As operations I see every city and whether it has a postcard
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/city"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "cities": [
          {
            "id": "19364a7d-3982-43e5-9630-9ce7c3a44e98",
            "name": "Boston",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "hasPostcard": true
          },
          {
            "id": "11fe7e0d-ef97-4a1d-9a87-8ad9da64fd91",
            "name": "Bremen",
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "hasPostcard": true
          },
          {
            "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
            "name": "Frankfurt",
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "hasPostcard": true
          },
          {
            "id": "7d1b4f96-2a58-4c67-b3e9-8f5c1a7d2e64",
            "name": "Gander",
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "hasPostcard": true
          },
          {
            "id": "4670768b-9029-4de4-a078-19284031b8c5",
            "name": "Goose Bay",
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "hasPostcard": true
          },
          {
            "id": "b6e3a827-4d19-4f52-9c7a-3e8b5d1f6a94",
            "name": "Knock",
            "country": {
              "code": "IE",
              "name": "Ireland"
            },
            "hasPostcard": true
          },
          {
            "id": "6ef8953e-7c45-417a-b850-7e3c53de54cd",
            "name": "New York",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "hasPostcard": true
          },
          {
            "id": "17c8f21f-b5a3-41f5-a1e3-16f4100c2342",
            "name": "Paris",
            "country": {
              "code": "FR",
              "name": "France"
            },
            "hasPostcard": true
          },
          {
            "id": "e30d5e72-29ca-4f01-8e75-fdc55e3b296a",
            "name": "Philadelphia",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "hasPostcard": true
          },
          {
            "id": "bb33c063-d0c3-4468-98ce-a048a78f409a",
            "name": "Reykjavik",
            "country": {
              "code": "IS",
              "name": "Iceland"
            },
            "hasPostcard": true
          },
          {
            "id": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83",
            "name": "Shannon",
            "country": {
              "code": "IE",
              "name": "Ireland"
            },
            "hasPostcard": true
          },
          {
            "id": "e5c4da3c-30af-4a50-be48-832cdb854cd7",
            "name": "St. Johns",
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "hasPostcard": true
          },
          {
            "id": "ec2d2121-804b-4f8f-a9d7-991ebd8465e8",
            "name": "Warsaw",
            "country": {
              "code": "PL",
              "name": "Poland"
            },
            "hasPostcard": true
          }
        ]
      }
      """

  Scenario: As operations no city is waiting for a postcard to exist
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/city?hasPostcard=false"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "cities": []
      }
      """

  Scenario: As operations I ask only for the cities that have a postcard
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/city?hasPostcard=true"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "cities": [
          {
            "id": "19364a7d-3982-43e5-9630-9ce7c3a44e98",
            "name": "Boston",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "hasPostcard": true
          },
          {
            "id": "11fe7e0d-ef97-4a1d-9a87-8ad9da64fd91",
            "name": "Bremen",
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "hasPostcard": true
          },
          {
            "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
            "name": "Frankfurt",
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "hasPostcard": true
          },
          {
            "id": "7d1b4f96-2a58-4c67-b3e9-8f5c1a7d2e64",
            "name": "Gander",
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "hasPostcard": true
          },
          {
            "id": "4670768b-9029-4de4-a078-19284031b8c5",
            "name": "Goose Bay",
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "hasPostcard": true
          },
          {
            "id": "b6e3a827-4d19-4f52-9c7a-3e8b5d1f6a94",
            "name": "Knock",
            "country": {
              "code": "IE",
              "name": "Ireland"
            },
            "hasPostcard": true
          },
          {
            "id": "6ef8953e-7c45-417a-b850-7e3c53de54cd",
            "name": "New York",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "hasPostcard": true
          },
          {
            "id": "17c8f21f-b5a3-41f5-a1e3-16f4100c2342",
            "name": "Paris",
            "country": {
              "code": "FR",
              "name": "France"
            },
            "hasPostcard": true
          },
          {
            "id": "e30d5e72-29ca-4f01-8e75-fdc55e3b296a",
            "name": "Philadelphia",
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "hasPostcard": true
          },
          {
            "id": "bb33c063-d0c3-4468-98ce-a048a78f409a",
            "name": "Reykjavik",
            "country": {
              "code": "IS",
              "name": "Iceland"
            },
            "hasPostcard": true
          },
          {
            "id": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83",
            "name": "Shannon",
            "country": {
              "code": "IE",
              "name": "Ireland"
            },
            "hasPostcard": true
          },
          {
            "id": "e5c4da3c-30af-4a50-be48-832cdb854cd7",
            "name": "St. Johns",
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "hasPostcard": true
          },
          {
            "id": "ec2d2121-804b-4f8f-a9d7-991ebd8465e8",
            "name": "Warsaw",
            "country": {
              "code": "PL",
              "name": "Poland"
            },
            "hasPostcard": true
          }
        ]
      }
      """

  Scenario: As operations a filter that is not a boolean is refused
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/city?hasPostcard=maybe"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "hasPostcard": ["hasPostcard must be a boolean value"]
        }
      }
      """

  Scenario: As an admin I cannot see every city
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/city"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I cannot see every city
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/city"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot see every city
    When I send a "GET" request to "/api/v1/city"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
