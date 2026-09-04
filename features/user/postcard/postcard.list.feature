Feature: Get the postcards I have collected

  Scenario: As a cabin crew I see the postcards I have earned and how many exist
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/user/me/postcard"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "postcards": [
          {
            "id": "6b1b8e82-b9fb-4501-8716-b039c22e5c08",
            "city": {
              "id": "e30d5e72-29ca-4f01-8e75-fdc55e3b296a",
              "name": "Philadelphia"
            },
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/f57fbaa1-4332-4dba-9d10-931cc053111f.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "awardedAt": "2025-01-01T16:18:00.000Z",
            "seenAt": null
          },
          {
            "id": "ede93ece-e158-44d9-9f5b-4bd295b605ec",
            "city": {
              "id": "6ef8953e-7c45-417a-b850-7e3c53de54cd",
              "name": "New York"
            },
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/aa25fe19-3d1b-48c7-919d-a0eab5eba254.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "awardedAt": "2025-01-02T02:45:00.000Z",
            "seenAt": null
          },
          {
            "id": "057741fa-357e-462e-a5c6-0d4e6091c685",
            "city": {
              "id": "e8e8d77d-4b22-42cb-b163-13d54eec3597",
              "name": "Frankfurt"
            },
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/dd8cd3b6-38bd-49b7-87f4-e03d8ec05147.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "awardedAt": "2025-01-03T11:45:00.000Z",
            "seenAt": null
          }
        ],
        "total": 13
      }
      """

  Scenario: As an admin who has never flown I hold no postcard but still see how many exist
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/user/me/postcard"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "postcards": [],
        "total": 13
      }
      """

  Scenario: As operations who has never flown I hold no postcard
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/user/me/postcard"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "postcards": [],
        "total": 13
      }
      """

  Scenario: As an unauthorized user I cannot see a collection
    When I send a "GET" request to "/api/v1/user/me/postcard"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
