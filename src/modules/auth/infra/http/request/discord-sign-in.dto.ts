import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  GuildJoinOutcome,
  GuildMembership,
} from '../../../../../core/provider/discord/types/discord-identity.types';

export class DiscordAuthorizationRequest {
  @ApiProperty({
    description:
      'Single-use authorization code Discord appended to the redirect URI',
    example: 'NhhvTDYsFcdgNLnnLijcl7Ku7bEEeee',
  })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiProperty({
    description:
      'Redirect URI the code was issued for. Must be one of the URIs this ' +
      'deployment allows, matched exactly.',
    example: 'https://mypreflight.io/auth/discord/callback',
  })
  @IsNotEmpty()
  @IsString()
  redirectUri!: string;

  @ApiProperty({
    description: 'PKCE verifier whose S256 challenge started the authorization',
    example: 'ZmFrZS1jb2RlLXZlcmlmaWVyLWZvci1kb2NzLW9ubHk',
  })
  @IsNotEmpty()
  @IsString()
  codeVerifier!: string;
}

export class LinkDiscordAccountRequest extends DiscordAuthorizationRequest {
  @ApiProperty({
    description:
      'Whether to add the user to the Discord server as part of linking. ' +
      'Requires the authorization to have been granted the `guilds.join` scope.',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  joinServer?: boolean;
}

export class UnlinkDiscordAccountRequest {
  @ApiProperty({
    description: 'Password the user signs in with today',
    example: 'P@$$$$w0rd',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;
}

export class LinkDiscordAccountResponse {
  @ApiProperty({
    description: 'Always true — a failed link is reported as an error instead',
    example: true,
  })
  linked!: boolean;

  @ApiProperty({
    description: 'Discord account identifier briefings will be delivered to',
    example: '100000000000000100',
  })
  userId!: string;

  @ApiProperty({
    description: 'Discord handle of the linked account',
    example: 'michael.doe',
  })
  username!: string;

  @ApiProperty({
    description: 'Discord display name of the linked account',
    example: 'Michael Doe',
    type: 'string',
    nullable: true,
  })
  globalName!: string | null;

  @ApiProperty({
    description: 'Avatar of the linked account, null when it has none',
    example:
      'https://cdn.discordapp.com/avatars/100000000000000100/b1c2d3e4f5061728394a5b6c7d8e9f00.png',
    type: 'string',
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiProperty({
    description:
      'How the server join went. `not_requested` when joining was not asked ' +
      'for, `failed` when Discord refused it — the link stands either way, but ' +
      'briefings cannot be delivered until the user is in the server.',
    example: 'joined',
    enum: ['joined', 'already_member', 'not_requested', 'failed'],
  })
  joinOutcome!: GuildJoinOutcome;
}

export class DiscordServerMembershipResponse {
  @ApiProperty({
    description:
      'Whether the linked Discord account is in the server briefings are sent ' +
      'from. `unknown` when membership could not be determined — no Discord ' +
      'account is linked, the gateway is offline, or Discord did not answer.',
    example: 'member',
    enum: ['member', 'not_member', 'unknown'],
  })
  status!: GuildMembership;
}
