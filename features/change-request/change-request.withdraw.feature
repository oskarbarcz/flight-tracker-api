Feature: Withdraw a change request I proposed

  Scenario: As a cabin crew I can withdraw my pending change request, after which it cannot be accepted
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905"
    Then the response status should be 204
    And the response body should be empty
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905/accept"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "This change request has already been decided or withdrawn."
      }
      """
    And I set database to initial state

  Scenario: As a cabin crew I cannot withdraw a change request someone else proposed
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/user-data-change-request/6fb17bfe-1836-4aaa-b68c-ce72f5440871"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "statusCode": 403,
        "error": "Forbidden",
        "message": "Only the requester may withdraw this change request."
      }
      """

  Scenario: As a cabin crew I cannot withdraw my change request once it is accepted
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/user-data-change-request/61c109eb-1d4c-41b5-b25c-a2be96984793"
    Then the response status should be 409
    And the response body should contain:
      """json
      {
        "statusCode": 409,
        "error": "Conflict",
        "message": "This change request has already been decided or withdrawn."
      }
      """

  Scenario: As a cabin crew I cannot withdraw a change request that does not exist
    Given I am signed in as "cabin crew"
    When I send a "DELETE" request to "/api/v1/user-data-change-request/0c9b7a3e-2f1d-4e8a-9b6c-5d4e3f2a1b0c"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Change request with given id does not exist."
      }
      """

  Scenario: As an operations I cannot withdraw a change request
    Given I am signed in as "operations"
    When I send a "DELETE" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an admin I cannot withdraw a change request
    Given I am signed in as "admin"
    When I send a "DELETE" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905"
    Then the response status should be 403
    And the response body should contain:
      """json
      {
        "message": "Forbidden resource",
        "error": "Forbidden",
        "statusCode": 403
      }
      """

  Scenario: As an unauthorized user I cannot withdraw a change request
    When I send a "DELETE" request to "/api/v1/user-data-change-request/acd93eae-b731-4794-9060-b7652bbc9905"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
