import { ApiProperty } from '@nestjs/swagger';

export type AirportNotamData = {
  notamId: string;
  dateCreated: Date;
  dateEffective: Date;
  dateExpire: Date | null;
  dateModified: Date;
  html: string;
  text: string;
  raw: string;
  nrc: string;
  qcode: string;
  qcodeCategory: string;
  qcodeSubject: string;
  qcodeStatus: string;
};

export type AirportNotams = {
  icaoCode: string;
  notams: AirportNotamData[];
};

export class GetAirportNotamResponse {
  @ApiProperty({
    description: 'NOTAM number as issued by the originating office',
    example: 'A3912/26',
  })
  notamId!: string;

  @ApiProperty({
    description: 'When the NOTAM was issued',
    example: '2026-08-01T13:53:00.000Z',
    type: String,
    format: 'date-time',
  })
  dateCreated!: Date;

  @ApiProperty({
    description: 'When the NOTAM comes into force',
    example: '2026-08-01T14:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  dateEffective!: Date;

  @ApiProperty({
    description:
      'When the NOTAM ceases to be in force, or null when it is published with no stated end',
    example: '2026-08-31T22:00:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  dateExpire!: Date | null;

  @ApiProperty({
    description: 'When the NOTAM was last amended',
    example: '2026-08-01T13:53:00.000Z',
    type: String,
    format: 'date-time',
  })
  dateModified!: Date;

  @ApiProperty({
    description: 'When this NOTAM was last imported from the source',
    example: '2026-08-13T09:12:44.000Z',
    type: String,
    format: 'date-time',
  })
  dateImported!: Date;

  @ApiProperty({
    description:
      'NOTAM body with aeronautical terms highlighted, as markup provided by the source. Sanitise before rendering.',
    example:
      '<b>TWY V</b> <b>CLOSED</b> FOR ACFT CATEGORY F BTN <b>TWY S2</b> AND <b>TWY Y</b>.',
  })
  html!: string;

  @ApiProperty({
    description: 'NOTAM body as plain text',
    example: 'TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.',
  })
  text!: string;

  @ApiProperty({
    description:
      'Complete NOTAM exactly as issued, including its Q, A, B, C and E lines',
    example:
      'A3912/26 NOTAMN\n Q) EDMM/QMXLC/IV/BO /A /000/999/5125N01214E005\n A) EDDP B) 2608011400 C) 2608312200\n E) TWY V CLOSED FOR ACFT CATEGORY F BTN TWY S2 AND TWY Y.',
  })
  raw!: string;

  @ApiProperty({
    description:
      'NOTAM record type: NOTAMN for a new NOTAM, NOTAMR for a replacement, NOTAMC for a cancellation',
    example: 'NOTAMN',
  })
  nrc!: string;

  @ApiProperty({
    description: 'ICAO Q-code of the NOTAM',
    example: 'QMXLC',
  })
  qcode!: string;

  @ApiProperty({
    description: 'Facility the Q-code applies to',
    example: 'Airport',
  })
  qcodeCategory!: string;

  @ApiProperty({
    description: 'Subject the Q-code reports on',
    example: 'Taxiway',
  })
  qcodeSubject!: string;

  @ApiProperty({
    description: 'Condition the Q-code reports',
    example: 'Closed',
  })
  qcodeStatus!: string;
}
