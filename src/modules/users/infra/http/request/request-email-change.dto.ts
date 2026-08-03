import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestEmailChangeDto {
  @ApiProperty({
    description: 'Address the user wants to sign in with from now on',
    example: 'new.address@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  newEmail!: string;

  @ApiProperty({
    description: 'Password the user signs in with today',
    example: 'P@$$$$w0rd',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;
}
