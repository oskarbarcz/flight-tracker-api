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
import { UpdateGsxSettingsDto } from '../request/update-gsx-settings.dto';
import { GsxSettings } from '../../../model/gsx-settings.model';
import { UpdateGsxSettingsCommand } from '../../../application/command/update-gsx-settings.command';
import { GetUserGsxSettingsQuery } from '../../../application/query/get-user-gsx-settings.query';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user')
export class UpdateGsxSettingsAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update own GSX settings',
    description:
      'Changes the GSX settings of the signed-in user. Settings left out of the request stay as they are, and turning the integration off keeps the automatic boarding and deboarding settings for when it is turned back on.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UpdateGsxSettingsDto })
  @ApiOkResponse({ type: GsxSettings })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<UpdateGsxSettingsDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Patch('/me/gsx-settings')
  async run(
    @Body() body: UpdateGsxSettingsDto,
    @Req() request: AuthorizedRequest,
  ): Promise<GsxSettings> {
    const userId = request.user.sub;

    const command = new UpdateGsxSettingsCommand(userId, body);
    await this.commandBus.execute(command);

    const query = new GetUserGsxSettingsQuery(userId);

    return this.queryBus.execute(query);
  }
}
