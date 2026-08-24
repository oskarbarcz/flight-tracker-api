import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedResponse {
  @ApiProperty({
    description: 'HTTP status message',
    example: 'Unauthorized',
    type: String,
  })
  message = 'Unauthorized';

  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
    type: Number,
  })
  statusCode = 401;
}
