import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { CreateUserDto } from '../request/create-user.dto';
import { GetUserDto } from '../request/get-user.dto';
import { CreateUserCommand } from '../../../application/command/create-user.command';
import { GetUserByIdQuery } from '../../../application/query/get-user-by-id.query';
import { GenericBadRequestResponse } from '../../../../../core/http/response/bad-request.response';
import { UnauthorizedResponse } from '../../../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../../../core/http/response/forbidden.response';
import { Role } from '../../../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '../../../model/user-role';

@ApiTags('user')
@Controller('/api/v1/user')
export class CreateUserAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create new user',
    description:
      '**NOTE:** This endpoint is only available for users with `admin` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User was created successfully',
    type: GetUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateUserDto>,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenResponse,
  })
  @Post()
  @Role(UserRole.Admin)
  async run(@Body() createUserDto: CreateUserDto): Promise<GetUserDto> {
    const userId = v4();

    const command = new CreateUserCommand(userId, createUserDto);
    await this.commandBus.execute(command);

    const query = new GetUserByIdQuery(userId);
    return this.queryBus.execute(query);
  }
}
