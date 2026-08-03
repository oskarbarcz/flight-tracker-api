import { IsNotEmpty, IsStrongPassword, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Password the user signs in with today',
    example: 'P@$$$$w0rd',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    description:
      'Password the user wants to sign in with. At least 12 characters, ' +
      'including an uppercase letter, a lowercase letter, a number and a symbol.',
    example: 'NeWsTr0nGP@$$$$w0rd',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword(
    {
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number and a symbol.',
    },
  )
  newPassword!: string;
}
