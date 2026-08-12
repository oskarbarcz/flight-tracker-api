import { Body, Controller, Patch, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateDiscordSettingsDto } from '../request/update-discord-settings.dto';
import { DiscordSettings } from '../../../model/discord-settings.model';
import { UpdateDiscordSettingsCommand } from '../../../application/command/update-discord-settings.command';
import { GetUserDiscordSettingsQuery } from '../../../application/query/get-user-discord-settings.query';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user')
export class UpdateDiscordSettingsAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update own Discord settings',
    description:
      'Turns the check-in briefing private message on or off for the signed-in user. A user with briefings on only receives them once a Discord account is linked.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UpdateDiscordSettingsDto })
  @ApiOkResponse({ type: DiscordSettings })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<UpdateDiscordSettingsDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Patch('/me/discord-settings')
  async run(
    @Body() body: UpdateDiscordSettingsDto,
    @Req() request: AuthorizedRequest,
  ): Promise<DiscordSettings> {
    const userId = request.user.sub;

    const command = new UpdateDiscordSettingsCommand(userId, body);
    await this.commandBus.execute(command);

    const query = new GetUserDiscordSettingsQuery(userId);

    return this.queryBus.execute(query);
  }
}
