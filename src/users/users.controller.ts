import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { uuid } from '../common/validation/uuid.param';
import { GenericBadRequestResponse } from '../common/dto/bad-request.dto';
import { CreateAircraftDto } from '../aircraft/dto/create-aircraft.dto';
import { GenericNotFoundResponse } from '../common/dto/not-found.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UserRole } from '@prisma/client';
import { Role } from '../auth/decorator/role.decorator';

@ApiTags('user')
@Controller('/api/v1/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({
    description: 'User data',
    type: CreateUserDto,
  })
  @ApiCreatedResponse({
    description: 'User was created successfully',
    type: GetUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateAircraftDto>,
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<GetUserDto> {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiOkResponse({
    description: 'Users list',
    type: GetUserDto,
    isArray: true,
  })
  @Get()
  @Role(UserRole.Admin)
  findAll(): Promise<GetUserDto[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve one user' })
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
  @ApiNotFoundResponse({
    description: 'User with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  findOne(@uuid('id') id: string): Promise<GetUserDto> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiBody({
    description: 'User data',
    type: UpdateUserDto,
  })
  @ApiOkResponse({
    description: 'User was updated successfully',
    type: GetUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<UpdateUserDto>,
  })
  @ApiNotFoundResponse({
    description: 'User with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  update(
    @uuid('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<GetUserDto> {
    return this.usersService.update(id, body);
  }
}
