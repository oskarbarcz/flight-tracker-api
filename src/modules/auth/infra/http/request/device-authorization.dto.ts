import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, ValidateIf } from 'class-validator';

export class StartDeviceAuthorizationRequest {
  @ApiProperty({
    description:
      'Name of the machine asking to sign in, shown to the user when they approve it and in their list of sessions',
    example: 'SIM-PC',
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(1, 64)
  deviceName?: string;
}

export class RedeemDeviceAuthorizationRequest {
  @ApiProperty({
    description: 'The `deviceCode` from `POST /api/v1/auth/device`',
    example: 'q0Hn8v1o3qGqWm7dJ9mP0xXcQe2yS5bWkT1uVfZrL4A',
  })
  @IsNotEmpty()
  @IsString()
  deviceCode!: string;
}
