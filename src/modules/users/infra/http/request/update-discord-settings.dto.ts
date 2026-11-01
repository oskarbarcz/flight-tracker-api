import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, ValidateIf } from 'class-validator';

export class UpdateDiscordSettingsDto {
  @ApiProperty({
    description:
      'Whether the user receives the flight briefing when they check in',
    example: false,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  briefingsEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether the user receives the preliminary loadsheet when boarding starts',
    example: false,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  preliminaryLoadsheetEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether the user receives the final loadsheet when boarding finishes',
    example: false,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  finalLoadsheetEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether the user is asked to allocate a departure delay raised on their flight, and told when operations approves that allocation',
    example: false,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  delayUpdatesEnabled?: boolean;

  @ApiProperty({
    description:
      'Whether the user lets their flight be published as their Discord activity',
    example: true,
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  richPresenceEnabled?: boolean;
}
