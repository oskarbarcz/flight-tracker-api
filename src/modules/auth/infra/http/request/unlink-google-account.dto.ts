import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnlinkGoogleAccountRequest {
  @ApiProperty({
    description: 'Password the user signs in with today',
    example: 'P@$$$$w0rd',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;
}
