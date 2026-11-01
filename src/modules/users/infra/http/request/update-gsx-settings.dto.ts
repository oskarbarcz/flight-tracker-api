import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, ValidateIf } from 'class-validator';

export class UpdateGsxSettingsDto {
  @ApiProperty({
    description:
      'Master switch for the GSX integration. While it is off the other GSX settings keep their values but have no effect',
    example: true,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  integrationEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether boarding starts automatically when the pilot requests it through GSX',
    example: false,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  autoBoardingEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether deboarding starts automatically when the pilot requests it through GSX',
    example: false,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  autoDeboardingEnabled?: boolean;
}
