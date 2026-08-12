export type DiscordMessageType = 'arrival' | 'departure' | 'briefing';

export type DiscordMessageBase = {
  content: string;
  type: DiscordMessageType;
  flightId: string;
};

export type DiscordMessage = DiscordMessageBase & {
  type: 'arrival' | 'departure';
};

export type DiscordDirectMessage = DiscordMessageBase & {
  type: 'briefing';
  attachments?: string[];
};
