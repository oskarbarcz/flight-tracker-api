import { ApiProperty } from '@nestjs/swagger';

export class GenericBadRequestResponse<RequestObj> {
  @ApiProperty({
    description: 'Detailed message what went wrong',
    example: 'Request validation failed.',
  })
  message!: string;

  @ApiProperty({
    description: 'HTTP status message',
    example: 'Bad Request',
    type: String,
  })
  error = 'Bad Request';

  @ApiProperty({
    description:
      'If errors are related to specific fields, they will be listed here',
    example: {
      registration: ['Registration must be unique'],
    },
    type: 'object',
    additionalProperties: { type: 'array', items: { type: 'string' } },
  })
  violations!: Record<keyof RequestObj, string[]>;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
    type: Number,
  })
  statusCode = 400;
}
