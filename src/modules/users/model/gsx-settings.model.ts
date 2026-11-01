import { ApiProperty } from '@nestjs/swagger';

export class GsxSettings {
  @ApiProperty({
    description:
      'Master switch for the GSX integration. Off unless the user turns it on. While it is off the other GSX settings keep their values but have no effect',
    example: false,
  })
  integrationEnabled!: boolean;

  @ApiProperty({
    description:
      'Whether boarding starts automatically when the pilot requests it through GSX. Applies only while the GSX integration is on',
    example: true,
  })
  autoBoardingEnabled!: boolean;

  @ApiProperty({
    description:
      'Whether deboarding starts automatically when the pilot requests it through GSX. Applies only while the GSX integration is on',
    example: true,
  })
  autoDeboardingEnabled!: boolean;
}
