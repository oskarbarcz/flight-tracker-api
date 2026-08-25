import { ApiProperty } from '@nestjs/swagger';

export class GenericConflictResponse {
  @ApiProperty({
    description: 'Detailed message what went wrong',
    example: 'New resource conflicts with existing resource.',
  })
  message!: string;

  @ApiProperty({
    description: 'HTTP status message',
    example: 'Conflict',
    type: String,
  })
  error = 'Conflict';

  @ApiProperty({
    description: 'HTTP status code',
    example: 409,
    type: Number,
  })
  statusCode = 409;
}
