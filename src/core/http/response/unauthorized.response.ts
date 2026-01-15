import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedResponse {
  @ApiProperty({
    description: 'HTTP status message',
    example: 'Unauthorized',
  })
  message = 'Unauthorized';

  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode = 401;
}
