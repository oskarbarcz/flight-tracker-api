import { Controller, Get, Post, Body, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { uuid } from '../common/validation/uuid.param';
import { GenericBadRequestResponse } from '../common/response/bad-request.response';
import { GenericNotFoundResponse } from '../common/response/not-found.response';
import { GetUserDto } from './dto/get-user.dto';
import { UserRole } from '@prisma/client';
import { Role } from '../auth/decorator/role.decorator';
import { UnauthorizedResponse } from '../common/response/unauthorized.response';
import { ForbiddenRequest } from '../common/response/forbidden.response';
import { AuthorizedRequest } from '../common/request/authorized.request';

@ApiTags('user')
@Controller('/api/v1/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Create new user',
    description:
      '**NOTE:** This endpoint is only available for users with `admin` role.',
  })
  @ApiBearerAuth()
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
    type: ForbiddenRequest,
  })
  @Post()
  @Role(UserRole.Admin)
  create(@Body() createUserDto: CreateUserDto): Promise<GetUserDto> {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Retrieve all users',
    description:
      '**NOTE:** This endpoint is only available for users with `admin` role.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Users list',
    type: GetUserDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenRequest,
  })
  @Get()
  @Role(UserRole.Admin)
  findAll(): Promise<GetUserDto[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({
    summary: 'Retrieve details of the current user',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    type: GetUserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get('/me')
  getMe(@Req() request: AuthorizedRequest): Promise<GetUserDto> {
    return this.usersService.findOne(request.user.sub);
  }

  @ApiOperation({
    summary: 'Retrieve one user',
    description:
      '**NOTE:** This endpoint is only available for users with `admin` role.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
  })
  @ApiOkResponse({
    description: 'User was created successfully',
    type: GetUserDto,
  })
  @ApiBadRequestResponse({
    description: 'User id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'User is not allowed to perform this action',
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'User with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  @Role(UserRole.Admin)
  findOne(@uuid('id') id: string): Promise<GetUserDto> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update user',
    description:
      '**NOTE:** This endpoint is only available for users with `admin` role.',
  })
  @ApiBearerAuth()
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
    type: ForbiddenRequest,
  })
  @ApiNotFoundResponse({
    description: 'User with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  @Role(UserRole.Admin)
  update(
    @uuid('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<GetUserDto> {
    return this.usersService.update(id, body);
  }
}
