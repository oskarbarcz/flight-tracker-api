export class DiscordGatewayDisabledError extends Error {
  constructor() {
    super('Discord gateway is disabled outside production.');
  }
}

export class DiscordChannelNotFoundError extends Error {
  constructor(channelId: string) {
    super(`Discord channel ${channelId} is not visible to the app.`);
  }
}

export class DiscordChannelNotTextBasedError extends Error {
  constructor(channelId: string) {
    super(`Discord channel ${channelId} does not accept text messages.`);
  }
}
