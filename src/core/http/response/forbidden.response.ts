import { ApiProperty } from '@nestjs/swagger';

export class ForbiddenResponse {
  @ApiProperty({
    description: 'Detailed message what went wrong',
    example: 'Forbidden resource',
  })
  message!: string;

  @ApiProperty({
    description: 'HTTP status message',
    example: 'Forbidden',
    type: String,
  })
  error = 'Forbidden';

  @ApiProperty({
    description: 'HTTP status code',
    example: 403,
    type: Number,
  })
  statusCode = 403;
}
