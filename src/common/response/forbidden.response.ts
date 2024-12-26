import { ApiProperty } from '@nestjs/swagger';

export class ForbiddenRequest {
  @ApiProperty({
    description: 'Detailed message what went wrong',
    example: 'Forbidden resource',
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status message',
    example: 'Forbidden',
  })
  message: 'Forbidden';

  @ApiProperty({
    description: 'HTTP status code',
    example: 403,
  })
  statusCode: 403;
}
