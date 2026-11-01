Feature: The Transponder can start signing in through the browser

  Scenario: The Transponder gets a code to show and a page to open
    When I send a "POST" request to "/api/v1/auth/device" with body:
      """json
      {
        "deviceName": "SIM-PC"
      }
      """
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "deviceCode": "@any",
        "userCode": "@any",
        "verificationUri": "http://localhost:5173/activate",
        "verificationUriComplete": "@any",
        "expiresIn": 600,
        "interval": 5
      }
      """
    And I remember the response body property "userCode" as "userCode"
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/auth/device/{{userCode}}"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "userCode": "@any",
        "client": "transponder",
        "deviceName": "SIM-PC",
        "createdAt": "@date('within 1 minute from now')",
        "expiresAt": "@any"
      }
      """
    And I set database to initial state

  Scenario: The Transponder can start without naming its machine
    When I send a "POST" request to "/api/v1/auth/device"
    Then the response status should be 201
    And the response body should contain:
      """json
      {
        "deviceCode": "@any",
        "userCode": "@any",
        "verificationUri": "http://localhost:5173/activate",
        "verificationUriComplete": "@any",
        "expiresIn": 600,
        "interval": 5
      }
      """
    And I remember the response body property "userCode" as "userCode"
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/auth/device/{{userCode}}"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "userCode": "@any",
        "client": "transponder",
        "deviceName": null,
        "createdAt": "@date('within 1 minute from now')",
        "expiresAt": "@any"
      }
      """
    And I set database to initial state

  Scenario Outline: The Transponder cannot name its machine with <case>
    When I send a "POST" request to "/api/v1/auth/device" with body:
      """json
      {
        "deviceName": <deviceName>
      }
      """
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Request validation failed.",
        "error": "Bad Request",
        "statusCode": 400,
        "violations": {
          "deviceName": <violations>
        }
      }
      """

    Examples:
      | case            | deviceName                                                          | violations                                                                                                                 |
      | an empty string | ""                                                                  | ["deviceName must be longer than or equal to 1 characters"]                                                                |
      | 65 characters   | "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" | ["deviceName must be shorter than or equal to 64 characters"]                                                              |
      | a number        | 42                                                                  | ["deviceName must be longer than or equal to 1 and shorter than or equal to 64 characters", "deviceName must be a string"] |
      | null            | null                                                                | ["deviceName must be longer than or equal to 1 characters", "deviceName must be a string"]                                 |
