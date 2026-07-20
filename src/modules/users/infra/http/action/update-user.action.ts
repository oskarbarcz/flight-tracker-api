import { Body, Controller, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateUserDto } from '../request/update-user.dto';
import { GetUserDto } from '../request/get-user.dto';
import { UpdateUserCommand } from '../../../application/command/update-user.command';
import { GetUserByIdQuery } from '../../../application/query/get-user-by-id.query';
import { UuidParam } from '../../../../../core/validation/uuid.param';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../model/user-role';

@ApiTags('user')
@Controller('/api/v1/user')
export class UpdateUserAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Update user',
    description:
      '**NOTE:** This endpoint is only available for users with `admin` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User was updated successfully',
    type: GetUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<UpdateUserDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: 'User with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  @Role(UserRole.Admin)
  async run(
    @UuidParam('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<GetUserDto> {
    const command = new UpdateUserCommand(id, body);
    await this.commandBus.execute(command);

    const query = new GetUserByIdQuery(id);
    return this.queryBus.execute(query);
  }
}
