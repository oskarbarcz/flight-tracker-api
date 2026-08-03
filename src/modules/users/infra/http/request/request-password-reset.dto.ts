import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Address the account signs in with',
    example: 'operations@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
