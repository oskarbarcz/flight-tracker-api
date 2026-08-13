import { ApiProperty } from '@nestjs/swagger';

export enum DiscordNotification {
  Briefing = 'briefing',
  PreliminaryLoadsheet = 'preliminary_loadsheet',
  FinalLoadsheet = 'final_loadsheet',
  DelayAllocation = 'delay_allocation',
  DelayApproval = 'delay_approval',
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
      'Whether the user is asked to allocate a departure delay raised on their flight',
    example: true,
  })
  delayAllocationEnabled!: boolean;

  @ApiProperty({
    description:
      'Whether the user is told when operations approves their delay allocation',
    example: true,
  })
  delayApprovalEnabled!: boolean;
}

export const DISCORD_NOTIFICATION_SETTING: Record<
  DiscordNotification,
  keyof DiscordSettings
> = {
  [DiscordNotification.Briefing]: 'briefingsEnabled',
  [DiscordNotification.PreliminaryLoadsheet]: 'preliminaryLoadsheetEnabled',
  [DiscordNotification.FinalLoadsheet]: 'finalLoadsheetEnabled',
  [DiscordNotification.DelayAllocation]: 'delayAllocationEnabled',
  [DiscordNotification.DelayApproval]: 'delayApprovalEnabled',
};
