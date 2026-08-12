import { ApiProperty } from '@nestjs/swagger';

export class DiscordSettings {
  @ApiProperty({
    description:
      'Whether the user receives a flight briefing as a Discord private message when checking in',
    example: true,
  })
  briefingsEnabled!: boolean;
}
