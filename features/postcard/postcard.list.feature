Feature: Get every postcard and its art

  Scenario: As operations I see every postcard regardless of who holds it
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/postcard"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "postcards": [
          {
            "id": "edf2c8d8-5cc6-433c-a291-b99886c2736a",
            "city": {
              "id": "19364a7d-3982-43e5-9630-9ce7c3a44e98",
              "name": "Boston"
            },
            "country": {
              "code": "US",
              "name": "United States of America"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/a13b60a0-9253-4c77-a8fa-68bfb07c5971.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
          },
          {
            "id": "6bae6830-8794-434e-89ca-2aa118fc9335",
            "city": {
              "id": "11fe7e0d-ef97-4a1d-9a87-8ad9da64fd91",
              "name": "Bremen"
            },
            "country": {
              "code": "DE",
              "name": "Germany"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/cefddab1-b5dc-4764-bb7d-43bf1f606208.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
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
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 1
          },
          {
            "id": "6e2d9b58-4a17-4c63-b8f5-2d1a7e6c9b34",
            "city": {
              "id": "7d1b4f96-2a58-4c67-b3e9-8f5c1a7d2e64",
              "name": "Gander"
            },
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/e51a8d27-3f64-4b92-a7c5-1d8f6b3e9a52.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
          },
          {
            "id": "2b470e7f-4d91-42e9-bb9f-1e0a9b997ccf",
            "city": {
              "id": "4670768b-9029-4de4-a078-19284031b8c5",
              "name": "Goose Bay"
            },
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/213b197b-b74a-4ae0-84ff-be37190c00d9.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
          },
          {
            "id": "9a5c3e71-8d24-4fab-9b17-5c8e2a4d6f19",
            "city": {
              "id": "b6e3a827-4d19-4f52-9c7a-3e8b5d1f6a94",
              "name": "Knock"
            },
            "country": {
              "code": "IE",
              "name": "Ireland"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/4f9b6c13-7e28-45da-8f61-3a5d2b7e9c64.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
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
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 1
          },
          {
            "id": "3b2409d5-3f5a-47e3-b25a-7b7e648094c3",
            "city": {
              "id": "17c8f21f-b5a3-41f5-a1e3-16f4100c2342",
              "name": "Paris"
            },
            "country": {
              "code": "FR",
              "name": "France"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/d7f1b070-69e5-46c5-8a9f-5c3fdd2b8a81.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
          },
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
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 1
          },
          {
            "id": "9f6e5970-def6-4332-bce4-573b1b5c9922",
            "city": {
              "id": "bb33c063-d0c3-4468-98ce-a048a78f409a",
              "name": "Reykjavik"
            },
            "country": {
              "code": "IS",
              "name": "Iceland"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/63ed849d-2865-418c-8d4c-059aab2096bb.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
          },
          {
            "id": "1c8f4a26-5b73-4e91-a2d6-7f3b9c5e8d40",
            "city": {
              "id": "5a2e8c17-9b64-4d3f-8e71-2c6a9f4b1d83",
              "name": "Shannon"
            },
            "country": {
              "code": "IE",
              "name": "Ireland"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/b74e1f38-9c52-4a67-8d13-6e2b5f9a3c48.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
          },
          {
            "id": "04032753-3666-465e-bae0-b2e2b2c588cb",
            "city": {
              "id": "e5c4da3c-30af-4a50-be48-832cdb854cd7",
              "name": "St. Johns"
            },
            "country": {
              "code": "CA",
              "name": "Canada"
            },
            "imageUrl": "http://functions-mock:1080/mypreflight-files/postcards/8d8fc159-e5b1-4a3d-ac4d-1f0d1aae8f1d.png",
            "width": 1152,
            "height": 1536,
            "status": "ready",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
          },
          {
            "id": "78e684b8-a61e-40df-b0bc-1dc96c180267",
            "city": {
              "id": "ec2d2121-804b-4f8f-a9d7-991ebd8465e8",
              "name": "Warsaw"
            },
            "country": {
              "code": "PL",
              "name": "Poland"
            },
            "imageUrl": null,
            "width": null,
            "height": null,
            "status": "pending",
            "statusChangedAt": null,
            "failureReason": null,
            "heldBy": 0
          }
        ]
      }
      """

  Scenario: As an admin I cannot see every postcard
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/postcard"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As a cabin crew I cannot see every postcard
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/postcard"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot see every postcard
    When I send a "GET" request to "/api/v1/postcard"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
