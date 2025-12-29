export type DiscordMessage = {
  content: string;
  type: 'arrival' | 'departure';
  flightId: string;
};
