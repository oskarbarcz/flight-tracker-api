import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailChangeDto {
  @ApiProperty({
    description: 'Token from the confirmation link sent to the new address',
    example: 'wS3xk1Nn7Yc9pQvR2tLmB4dF6hJ8kZgA1sD3fG5hJ7k',
  })
  @IsNotEmpty()
  @IsString()
  token!: string;
}
