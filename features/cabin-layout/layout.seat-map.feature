Feature: Read the seats of a cabin layout

  Background:
    Given I am signed in as "operations"
    When I send a "POST" request to "/api/v1/cabin-layout/sync"
    Then the response status should be 200

  Scenario: A double-deck aircraft reports both decks and its true seat total
    When I send a "GET" request to "/api/v1/cabin-layout/lh-74h/seat-map"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "layoutId": "lh-74h",
        "airlineIata": "LH",
        "aircraftIata": "74H",
        "revision": 1,
        "aircraftType": "Boeing 747-830",
        "aircraftTypeDisplayed": "Boeing 747-8",
        "manufacturer": "Boeing",
        "haulType": "Short Haul",
        "isDualDeck": true,
        "totalSeats": 364,
        "seatCounts": {
          "first": 8,
          "total": 364,
          "economy": 244,
          "business": 80,
          "premium_economy": 32
        },
        "lastUpdated": "2025-03-31",
        "fetchedAt": "@date('within 1 minute from now')",
        "decks": [
          {
            "deck": "main",
            "sourceSlug": "lh-74h-m",
            "canvas": {
              "width": 800,
              "height": 5239
            },
            "seatCount": 332,
            "lastUpdated": "2025-03-31",
            "assets": {
              "svg": "https://maptool.aerolopa.com/api/v1/aircraft/lh-74h-m/svg",
              "image": "https://d9k46j35fmriq.cloudfront.net/maptool/seatmaps/lh-74h-m.webp?v=1786777526",
              "seatRects": "https://maptool.aerolopa.com/api/v1/aircraft/lh-74h-m/seat-rects",
              "imageNeutral": "https://d9k46j35fmriq.cloudfront.net/maptool/seatmaps/lh-74h-m.neutral.webp?v=1786777526"
            },
            "cabins": [
              {
                "code": "F",
                "name": "First Suites",
                "rows": "1 to 3",
                "pitch": "83\"",
                "width": "30.5\"",
                "recline": "180\u00b0",
                "seatCount": 8,
                "description": "Eight suites located in the front main deck cabin. The cabin floor incorporates impact sound insulation which muffles the noise of foot traffic. Each suite is equipped with an individual storage locker positioned at the base of the ottoman"
              },
              {
                "code": "J",
                "name": "Business seats",
                "rows": "4 to 11",
                "pitch": "64\"",
                "width": "20\"",
                "recline": "180\u00b0",
                "seatCount": 48,
                "description": "48 seats based on the Collins Diamond Parallel platform, configured 2-2-2. Each seat is equipped with two storage compartments beneath the screen large enough to stow hold water bottles, reading material, and a small travel bag"
              },
              {
                "code": "W",
                "name": "Premium Economy seats",
                "rows": "21 to 25",
                "pitch": "38\"",
                "width": "19\"",
                "recline": "8\"",
                "seatCount": 32,
                "description": "Thirty-two ZIMmagic seats arranged in a 2-4-2 configuration featuring a ladder style foot rest. Front row seats are equipped with an integrated leg-rest and foot-rest"
              },
              {
                "code": "M",
                "name": "Economy seats",
                "rows": "16 to 20, 27 to 49",
                "pitch": "31\"",
                "width": "17.1\u201d",
                "recline": "6\"",
                "seatCount": 244,
                "description": "244 Recaro CL3520 seats arranged in a 3-4-3 configuration across two cabins"
              }
            ],
            "seats": "@any"
          },
          {
            "deck": "upper",
            "sourceSlug": "lh-74h-u",
            "canvas": {
              "width": 800,
              "height": 2507
            },
            "seatCount": 32,
            "lastUpdated": "2025-03-31",
            "assets": {
              "svg": "https://maptool.aerolopa.com/api/v1/aircraft/lh-74h-u/svg",
              "image": "https://d9k46j35fmriq.cloudfront.net/maptool/seatmaps/lh-74h-u.webp?v=1786777553",
              "seatRects": "https://maptool.aerolopa.com/api/v1/aircraft/lh-74h-u/seat-rects",
              "imageNeutral": "https://d9k46j35fmriq.cloudfront.net/maptool/seatmaps/lh-74h-u.neutral.webp?v=1786777553"
            },
            "cabins": [
              {
                "code": "J",
                "name": "Business seats",
                "rows": "81 to 88",
                "pitch": "64\"",
                "width": "20\"",
                "recline": "180\u00b0",
                "seatCount": 32,
                "description": "Thirty-two seats based on the Collins Diamond Parallel platform, configured 2-2. Each seat is equipped with two storage compartments beneath the screen large enough to stow hold water bottles, reading material, and a small travel bag"
              }
            ],
            "seats": "@any"
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: A single-deck aircraft reports one main deck
    When I send a "GET" request to "/api/v1/cabin-layout/kl-738/seat-map"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "layoutId": "kl-738",
        "airlineIata": "KL",
        "aircraftIata": "738",
        "revision": 1,
        "aircraftType": "Boeing 737-800",
        "aircraftTypeDisplayed": "Boeing 737-800",
        "manufacturer": "Boeing",
        "haulType": "Short Haul",
        "isDualDeck": false,
        "totalSeats": 186,
        "seatCounts": {
          "first": 0,
          "total": 186,
          "economy": 156,
          "business": 30,
          "premium_economy": 0
        },
        "lastUpdated": "2025-03-20",
        "fetchedAt": "@date('within 1 minute from now')",
        "decks": [
          {
            "deck": "main",
            "sourceSlug": "kl-738",
            "canvas": {
              "width": 800,
              "height": 4213
            },
            "seatCount": 186,
            "lastUpdated": "2025-03-20",
            "assets": {
              "svg": "https://maptool.aerolopa.com/api/v1/aircraft/kl-738/svg",
              "image": "https://d9k46j35fmriq.cloudfront.net/maptool/seatmaps/kl-738.webp?v=1786776298",
              "seatRects": "https://maptool.aerolopa.com/api/v1/aircraft/kl-738/seat-rects",
              "imageNeutral": "https://d9k46j35fmriq.cloudfront.net/maptool/seatmaps/kl-738.neutral.webp?v=1786776298"
            },
            "cabins": [
              {
                "code": "M",
                "name": "Economy seats",
                "rows": "1 to 32",
                "pitch": "30\" to 33\"",
                "width": "17\"",
                "recline": "3\"",
                "seatCount": 186,
                "description": "186 Recaro SL3710 fabric upholstered seats featuring an adjustable headrest, a personal device holder, and moveable armrests"
              }
            ],
            "seats": "@any"
          }
        ]
      }
      """
    And I set database to initial state

  Scenario: Reading a layout twice does not create a second revision
    When I send a "GET" request to "/api/v1/cabin-layout/kl-738/seat-map"
    Then the response status should be 200
    When I send a "GET" request to "/api/v1/cabin-layout/kl-738/seat-map"
    Then the response status should be 200
    And the response body should have the property "revision"
    When I send a "POST" request to "/api/v1/cabin-layout/kl-738/refresh"
    Then the response status should be 200
    And the response body should contain:
      """json
      {
        "layoutId": "kl-738",
        "changed": false,
        "revision": 1
      }
      """
    And I set database to initial state

  Scenario: The seats of a layout that is not catalogued cannot be read
    When I send a "GET" request to "/api/v1/cabin-layout/zz-999/seat-map"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Cabin layout zz-999 does not exist."
      }
      """
    And I set database to initial state

  Scenario: Cabin crew can read the seats of a layout
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/cabin-layout/kl-738/seat-map"
    Then the response status should be 200
    And the response body should have the property "decks"
    And I set database to initial state

  Scenario: Admin can read the seats of a layout
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/cabin-layout/kl-738/seat-map"
    Then the response status should be 200
    And I set database to initial state

  Scenario: An unauthorised actor cannot read the seats of a layout
    When I send a "GET" request to "/api/v1/cabin-layout/kl-738/seat-map" with bearer token "invalid"
    Then the response status should be 401
    And the response body should contain:
      """json
      {
        "message": "Unauthorized",
        "statusCode": 401
      }
      """
    And I set database to initial state
