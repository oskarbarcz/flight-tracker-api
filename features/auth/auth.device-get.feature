Feature: As a user I can see a device sign-in waiting for my approval

  Scenario: As a cabin crew I see the Transponder asking to sign in
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/auth/device/SFCD-NLVQ"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "userCode": "SFCD-NLVQ",
        "client": "transponder",
        "deviceName": "SIM-PC",
        "createdAt": "2026-11-01T10:00:00.000Z",
        "expiresAt": "2036-01-01T00:00:00.000Z"
      }
      """

  Scenario: As an admin I see the Transponder asking to sign in
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/auth/device/SFCD-NLVQ"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "userCode": "SFCD-NLVQ",
        "client": "transponder",
        "deviceName": "SIM-PC",
        "createdAt": "2026-11-01T10:00:00.000Z",
        "expiresAt": "2036-01-01T00:00:00.000Z"
      }
      """

  Scenario: As a cabin crew I can type the code in lower case and without the dash
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/auth/device/sfcdnlvq"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "userCode": "SFCD-NLVQ",
        "client": "transponder",
        "deviceName": "SIM-PC",
        "createdAt": "2026-11-01T10:00:00.000Z",
        "expiresAt": "2036-01-01T00:00:00.000Z"
      }
      """

  Scenario Outline: As a cabin crew I cannot see a sign-in that <case>
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/auth/device/<userCode>"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "message": "Device sign-in does not exist or has expired.",
        "error": "Not Found",
        "statusCode": 404
      }
      """

    Examples:
      | case                 | userCode  |
      | does not exist       | BBBB-BBBB |
      | has expired          | XZFM-RQMB |
      | was already approved | ZBHG-BXCL |
      | was already declined | NVMD-PBFN |

  Scenario: The Transponder cannot see a device sign-in
    Given I am signed in to the Transponder as "cabin crew"
    When I send a "GET" request to "/api/v1/auth/device/SFCD-NLVQ"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "This action is not available to the Transponder.",
        "error": "Forbidden",
        "statusCode": 403
      }
      """
    And I set database to initial state

  Scenario: As an unauthorized user I cannot see a device sign-in
    When I send a "GET" request to "/api/v1/auth/device/SFCD-NLVQ"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
