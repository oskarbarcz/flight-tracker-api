import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInRequest {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
