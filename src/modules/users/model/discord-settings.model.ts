import { ApiProperty } from '@nestjs/swagger';

export enum DiscordNotification {
  Briefing = 'briefing',
  PreliminaryLoadsheet = 'preliminary_loadsheet',
  FinalLoadsheet = 'final_loadsheet',
  DelayUpdates = 'delay_updates',
}

export class DiscordSettings {
  @ApiProperty({
    description:
      'Whether the user receives the flight briefing when they check in',
    example: true,
  })
  briefingsEnabled!: boolean;

  @ApiProperty({
    description:
      'Whether the user receives the preliminary loadsheet when boarding starts',
    example: true,
  })
  preliminaryLoadsheetEnabled!: boolean;

  @ApiProperty({
    description:
      'Whether the user receives the final loadsheet when boarding finishes',
    example: true,
  })
  finalLoadsheetEnabled!: boolean;

  @ApiProperty({
    description:
      'Whether the user is asked to allocate a departure delay raised on their flight, and told when operations approves that allocation',
    example: true,
  })
  delayUpdatesEnabled!: boolean;
}

export const DISCORD_NOTIFICATION_SETTING: Record<
  DiscordNotification,
  keyof DiscordSettings
> = {
  [DiscordNotification.Briefing]: 'briefingsEnabled',
  [DiscordNotification.PreliminaryLoadsheet]: 'preliminaryLoadsheetEnabled',
  [DiscordNotification.FinalLoadsheet]: 'finalLoadsheetEnabled',
  [DiscordNotification.DelayUpdates]: 'delayUpdatesEnabled',
};
