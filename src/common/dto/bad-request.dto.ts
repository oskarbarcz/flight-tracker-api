import { ApiProperty } from '@nestjs/swagger';

export class GenericBadRequestResponse {
  @ApiProperty({
    description: 'Detailed message what went wrong',
    example: 'Resource with given id does not exist.',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status message',
    example: 'Not Found',
  })
  error: 'Not Found';

  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode: 404;
}
