import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInRequest {
  @ApiProperty({
    description: 'User email address',
    example: 'operations@example.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'P@$$$$w0rd',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class SignInResponse {
  @ApiProperty({
    description:
      'JWT authorization token containing fields:<br />' +
      '`sub` - user unique system identifier,<br />' +
      '`session` - session unique system identifier,<br />' +
      '`name` - user name and surname,<br />' +
      '`email` - user email address,<br />' +
      '`role` — a role that is assigned to a user.',
    example: 'eyJhbGci...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token that can be used to refresh `accessToken`',
    example: 'eyJhbGci...',
  })
  refreshToken!: string;
}
