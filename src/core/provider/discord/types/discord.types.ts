export type DiscordChannelMessageType = 'arrival' | 'departure';

export type DiscordDirectMessageType =
  | 'briefing'
  | 'preliminary-loadsheet'
  | 'final-loadsheet'
  | 'delay-allocation'
  | 'delay-approval';

export type DiscordMessageType =
  | DiscordChannelMessageType
  | DiscordDirectMessageType;

export type DiscordMessageBase = {
  content: string;
  type: DiscordMessageType;
  flightId: string;
};

export type DiscordMessage = DiscordMessageBase & {
  type: DiscordChannelMessageType;
};

export type DiscordDirectMessage = DiscordMessageBase & {
  type: DiscordDirectMessageType;
  attachments?: string[];
};
