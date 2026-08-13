import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDiscordSettingsDto {
  @ApiProperty({
    description:
      'Whether the user receives the flight briefing when they check in',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  briefingsEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether the user receives the preliminary loadsheet when boarding starts',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  preliminaryLoadsheetEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether the user receives the final loadsheet when boarding finishes',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  finalLoadsheetEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether the user is asked to allocate a departure delay raised on their flight, and told when operations approves that allocation',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  delayUpdatesEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether the user lets their flight be published as their Discord activity',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  richPresenceEnabled?: boolean;
}
