Feature: List airport NOTAMs

  Scenario: As an admin I can read the NOTAMs in force at an airport
    Given I am signed in as "admin"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A4501/99",
          "dateCreated": "2026-07-20T12:00:00.000Z",
          "dateEffective": "2099-01-01T00:00:00.000Z",
          "dateExpire": "2099-06-30T23:59:00.000Z",
          "dateModified": "2026-07-20T12:00:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>APRON</b> 3 <b>WORK IN PROGRESS</b>, STANDS 301 THRU 309 NOT AVBL.",
          "text": "APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "raw": "A4501/99 NOTAMN\n Q) EPWW/QMNLW/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 9901010000 C) 9906302359\n E) APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "nrc": "NOTAMN",
          "qcode": "QMNLW",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Apron",
          "qcodeStatus": "Work in progress"
        },
        {
          "notamId": "A3912/26",
          "dateCreated": "2026-07-01T13:53:00.000Z",
          "dateEffective": "2026-07-01T14:00:00.000Z",
          "dateExpire": "2099-12-31T22:00:00.000Z",
          "dateModified": "2026-07-01T13:53:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>TWY V</b> <b>CLOSED</b> FOR ACFT CATEGORY F BTN <b>TWY S2</b> AND <b>TWY Y</b>.",
          "text": "TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "raw": "A3912/26 NOTAMN\n Q) EPWW/QMXLC/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 2607011400 C) 9912312200\n E) TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "nrc": "NOTAMN",
          "qcode": "QMXLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Taxiway",
          "qcodeStatus": "Closed"
        },
        {
          "notamId": "A2204/26",
          "dateCreated": "2026-06-15T08:10:00.000Z",
          "dateEffective": "2026-06-15T09:00:00.000Z",
          "dateExpire": null,
          "dateModified": "2026-06-16T11:20:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "BIRD ACTIVITY IN THE VICINITY OF <b>AD</b>.",
          "text": "BIRD ACTIVITY IN THE VICINITY OF AD.",
          "raw": "A2204/26 NOTAMN\n Q) EPWW/QFAXX/IV/NBO/A /000/999/5210N02058E005\n A) EPWA B) 2606150900 C) PERM\n E) BIRD ACTIVITY IN THE VICINITY OF AD.",
          "nrc": "NOTAMN",
          "qcode": "QFAXX",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Airport",
          "qcodeStatus": "Concentration of birds"
        }
      ]
      """

  Scenario: As operations I can read the NOTAMs in force at an airport
    Given I am signed in as "operations"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A4501/99",
          "dateCreated": "2026-07-20T12:00:00.000Z",
          "dateEffective": "2099-01-01T00:00:00.000Z",
          "dateExpire": "2099-06-30T23:59:00.000Z",
          "dateModified": "2026-07-20T12:00:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>APRON</b> 3 <b>WORK IN PROGRESS</b>, STANDS 301 THRU 309 NOT AVBL.",
          "text": "APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "raw": "A4501/99 NOTAMN\n Q) EPWW/QMNLW/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 9901010000 C) 9906302359\n E) APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "nrc": "NOTAMN",
          "qcode": "QMNLW",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Apron",
          "qcodeStatus": "Work in progress"
        },
        {
          "notamId": "A3912/26",
          "dateCreated": "2026-07-01T13:53:00.000Z",
          "dateEffective": "2026-07-01T14:00:00.000Z",
          "dateExpire": "2099-12-31T22:00:00.000Z",
          "dateModified": "2026-07-01T13:53:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>TWY V</b> <b>CLOSED</b> FOR ACFT CATEGORY F BTN <b>TWY S2</b> AND <b>TWY Y</b>.",
          "text": "TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "raw": "A3912/26 NOTAMN\n Q) EPWW/QMXLC/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 2607011400 C) 9912312200\n E) TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "nrc": "NOTAMN",
          "qcode": "QMXLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Taxiway",
          "qcodeStatus": "Closed"
        },
        {
          "notamId": "A2204/26",
          "dateCreated": "2026-06-15T08:10:00.000Z",
          "dateEffective": "2026-06-15T09:00:00.000Z",
          "dateExpire": null,
          "dateModified": "2026-06-16T11:20:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "BIRD ACTIVITY IN THE VICINITY OF <b>AD</b>.",
          "text": "BIRD ACTIVITY IN THE VICINITY OF AD.",
          "raw": "A2204/26 NOTAMN\n Q) EPWW/QFAXX/IV/NBO/A /000/999/5210N02058E005\n A) EPWA B) 2606150900 C) PERM\n E) BIRD ACTIVITY IN THE VICINITY OF AD.",
          "nrc": "NOTAMN",
          "qcode": "QFAXX",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Airport",
          "qcodeStatus": "Concentration of birds"
        }
      ]
      """

  Scenario: As a cabin crew I can read the NOTAMs in force at an airport
    Given I am signed in as "cabin crew"
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A4501/99",
          "dateCreated": "2026-07-20T12:00:00.000Z",
          "dateEffective": "2099-01-01T00:00:00.000Z",
          "dateExpire": "2099-06-30T23:59:00.000Z",
          "dateModified": "2026-07-20T12:00:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>APRON</b> 3 <b>WORK IN PROGRESS</b>, STANDS 301 THRU 309 NOT AVBL.",
          "text": "APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "raw": "A4501/99 NOTAMN\n Q) EPWW/QMNLW/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 9901010000 C) 9906302359\n E) APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "nrc": "NOTAMN",
          "qcode": "QMNLW",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Apron",
          "qcodeStatus": "Work in progress"
        },
        {
          "notamId": "A3912/26",
          "dateCreated": "2026-07-01T13:53:00.000Z",
          "dateEffective": "2026-07-01T14:00:00.000Z",
          "dateExpire": "2099-12-31T22:00:00.000Z",
          "dateModified": "2026-07-01T13:53:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>TWY V</b> <b>CLOSED</b> FOR ACFT CATEGORY F BTN <b>TWY S2</b> AND <b>TWY Y</b>.",
          "text": "TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "raw": "A3912/26 NOTAMN\n Q) EPWW/QMXLC/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 2607011400 C) 9912312200\n E) TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "nrc": "NOTAMN",
          "qcode": "QMXLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Taxiway",
          "qcodeStatus": "Closed"
        },
        {
          "notamId": "A2204/26",
          "dateCreated": "2026-06-15T08:10:00.000Z",
          "dateEffective": "2026-06-15T09:00:00.000Z",
          "dateExpire": null,
          "dateModified": "2026-06-16T11:20:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "BIRD ACTIVITY IN THE VICINITY OF <b>AD</b>.",
          "text": "BIRD ACTIVITY IN THE VICINITY OF AD.",
          "raw": "A2204/26 NOTAMN\n Q) EPWW/QFAXX/IV/NBO/A /000/999/5210N02058E005\n A) EPWA B) 2606150900 C) PERM\n E) BIRD ACTIVITY IN THE VICINITY OF AD.",
          "nrc": "NOTAMN",
          "qcode": "QFAXX",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Airport",
          "qcodeStatus": "Concentration of birds"
        }
      ]
      """

  Scenario: As an unauthorized user I can read the NOTAMs in force at an airport
    When I send a "GET" request to "/api/v1/airport/616cbdd7-ccfc-4687-8cf6-1e7236435046/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      [
        {
          "notamId": "A4501/99",
          "dateCreated": "2026-07-20T12:00:00.000Z",
          "dateEffective": "2099-01-01T00:00:00.000Z",
          "dateExpire": "2099-06-30T23:59:00.000Z",
          "dateModified": "2026-07-20T12:00:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>APRON</b> 3 <b>WORK IN PROGRESS</b>, STANDS 301 THRU 309 NOT AVBL.",
          "text": "APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "raw": "A4501/99 NOTAMN\n Q) EPWW/QMNLW/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 9901010000 C) 9906302359\n E) APRON 3 WORK IN PROGRESS, STANDS 301 THRU 309 NOT AVBL.",
          "nrc": "NOTAMN",
          "qcode": "QMNLW",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Apron",
          "qcodeStatus": "Work in progress"
        },
        {
          "notamId": "A3912/26",
          "dateCreated": "2026-07-01T13:53:00.000Z",
          "dateEffective": "2026-07-01T14:00:00.000Z",
          "dateExpire": "2099-12-31T22:00:00.000Z",
          "dateModified": "2026-07-01T13:53:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "<b>TWY V</b> <b>CLOSED</b> FOR ACFT CATEGORY F BTN <b>TWY S2</b> AND <b>TWY Y</b>.",
          "text": "TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "raw": "A3912/26 NOTAMN\n Q) EPWW/QMXLC/IV/BO /A /000/999/5210N02058E005\n A) EPWA B) 2607011400 C) 9912312200\n E) TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.",
          "nrc": "NOTAMN",
          "qcode": "QMXLC",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Taxiway",
          "qcodeStatus": "Closed"
        },
        {
          "notamId": "A2204/26",
          "dateCreated": "2026-06-15T08:10:00.000Z",
          "dateEffective": "2026-06-15T09:00:00.000Z",
          "dateExpire": null,
          "dateModified": "2026-06-16T11:20:00.000Z",
          "dateImported": "2026-08-01T06:00:00.000Z",
          "html": "BIRD ACTIVITY IN THE VICINITY OF <b>AD</b>.",
          "text": "BIRD ACTIVITY IN THE VICINITY OF AD.",
          "raw": "A2204/26 NOTAMN\n Q) EPWW/QFAXX/IV/NBO/A /000/999/5210N02058E005\n A) EPWA B) 2606150900 C) PERM\n E) BIRD ACTIVITY IN THE VICINITY OF AD.",
          "nrc": "NOTAMN",
          "qcode": "QFAXX",
          "qcodeCategory": "Airport",
          "qcodeSubject": "Airport",
          "qcodeStatus": "Concentration of birds"
        }
      ]
      """

  Scenario: An airport with no NOTAMs returns an empty list
    When I send a "GET" request to "/api/v1/airport/523b2d2f-9b60-405a-bd5a-90eed1b58e9a/notam"
    Then the response status should be 200
    And the response body should contain:
      """json
      []
      """

  Scenario: NOTAMs of a non existing airport cannot be read
    When I send a "GET" request to "/api/v1/airport/11111111-1111-4111-8111-111111111111/notam"
    Then the response status should be 404
    And the response body should contain:
      """json
      {
        "statusCode": 404,
        "error": "Not Found",
        "message": "Airport with given id does not exist."
      }
      """

  Scenario: NOTAMs cannot be read with a malformed airport id
    When I send a "GET" request to "/api/v1/airport/not-a-uuid/notam"
    Then the response status should be 400
    And the response body should contain:
      """json
      {
        "message": "Validation failed (uuid v 4 is expected)",
        "error": "Bad Request",
        "statusCode": 400
      }
      """
