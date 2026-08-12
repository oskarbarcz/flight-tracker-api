export const GUILDS_JOIN_SCOPE = 'guilds.join';

const AVATAR_CDN_BASE = 'https://cdn.discordapp.com/avatars';

export type DiscordAuthorization = {
  accessToken: string;
  scopes: string[];
};

export type DiscordIdentity = {
  discordId: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
};

export type GuildMembership = 'member' | 'not_member' | 'unknown';

export type GuildJoinOutcome =
  | 'joined'
  | 'already_member'
  | 'not_requested'
  | 'failed';

export function buildDiscordAvatarUrl(
  discordId: string | null,
  avatar: string | null,
): string | null {
  if (!discordId || !avatar) {
    return null;
  }

  const extension = avatar.startsWith('a_') ? 'gif' : 'png';

  return `${AVATAR_CDN_BASE}/${discordId}/${avatar}.${extension}`;
}
