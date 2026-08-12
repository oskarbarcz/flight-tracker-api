import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateDiscordSettingsDto {
  @ApiProperty({
    description:
      'Whether the user receives a flight briefing as a Discord private message when checking in',
    example: false,
  })
  @IsBoolean()
  briefingsEnabled!: boolean;
}
