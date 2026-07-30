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
import { UpdateOwnProfileDto } from '../request/update-own-profile.dto';
import { GetOwnUserDto } from '../request/get-user.dto';
import { UpdateOwnProfileCommand } from '../../../application/command/update-own-profile.command';
import { GetOwnUserQuery } from '../../../application/query/get-own-user.query';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { AuthorizedRequest } from '../../../../../core/http/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user')
export class UpdateOwnProfileAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update own profile',
    description:
      'Updates the name, pilot license, home airport and Simbrief user ID of the signed-in user. Any other user property is rejected.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UpdateOwnProfileDto })
  @ApiOkResponse({
    type: GetOwnUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<UpdateOwnProfileDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Patch('/me')
  async run(
    @Body() body: UpdateOwnProfileDto,
    @Req() request: AuthorizedRequest,
  ): Promise<GetOwnUserDto> {
    const userId = request.user.sub;

    const command = new UpdateOwnProfileCommand(userId, body);
    await this.commandBus.execute(command);

    const query = new GetOwnUserQuery(userId);
    return this.queryBus.execute(query);
  }
}
