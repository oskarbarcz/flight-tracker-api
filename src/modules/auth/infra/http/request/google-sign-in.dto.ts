import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleSignInRequest {
  @ApiProperty({
    description:
      'ID token issued by Google Identity Services for this application',
    example: 'eyJhbGci...',
  })
  @IsNotEmpty()
  @IsString()
  @IsJWT()
  idToken!: string;
}
