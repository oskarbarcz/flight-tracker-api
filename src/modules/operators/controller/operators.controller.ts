import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OperatorsService } from '../service/operators.service';
import { CreateOperatorDto } from '../dto/create-operator.dto';
import { UpdateOperatorDto } from '../dto/update-operator.dto';
import { UuidParam } from '../../../core/validation/uuid.param';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  PartialType,
} from '@nestjs/swagger';
import { Operator } from '../entity/operator.entity';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { GenericBadRequestResponse } from '../../../core/http/response/bad-request.response';
import { GenericNotFoundResponse } from '../../../core/http/response/not-found.response';
import { UnauthorizedResponse } from '../../../core/http/response/unauthorized.response';
import { ForbiddenResponse } from '../../../core/http/response/forbidden.response';
import { Role } from '../../../core/http/auth/decorator/role.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('operator')
@Controller('/api/v1/operator')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @ApiOperation({
    summary: 'Create new operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateOperatorDto })
  @ApiCreatedResponse({
    description: 'Operator was created successfully',
    type: Operator,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateOperatorDto>,
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
  @Role(UserRole.Operations)
  create(@Body() createOperatorDto: CreateOperatorDto): Promise<Operator> {
    return this.operatorsService.create(createOperatorDto);
  }

  @ApiOperation({ summary: 'Retrieve all operators' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: 'Operators list',
    type: Operator,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @Get()
  findAll(): Promise<Operator[]> {
    return this.operatorsService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve one operator' })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiOkResponse({
    description: 'Operator was created successfully',
    type: PartialType(Operator),
  })
  @ApiBadRequestResponse({
    description: 'Operator id is not valid uuid v4',
    type: GenericBadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized (token is missing)',
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({
    description: 'Operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Get(':id')
  findOne(@UuidParam('id') id: string): Promise<Operator> {
    return this.operatorsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiBody({ type: UpdateOperatorDto })
  @ApiOkResponse({
    description: 'Operator was updated successfully',
    type: Operator,
  })
  @ApiBadRequestResponse({
    description: 'Request validation failed',
    type: GenericBadRequestResponse<CreateOperatorDto>,
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
    description: 'Operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Patch(':id')
  @Role(UserRole.Operations)
  update(
    @UuidParam('id') id: string,
    @Body() updateOperatorDto: UpdateOperatorDto,
  ): Promise<Operator> {
    return this.operatorsService.update(id, updateOperatorDto);
  }

  @ApiOperation({
    summary: 'Remove operator',
    description:
      '**NOTE:** This endpoint is only available for users with `operations` role.',
  })
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    description: 'Operator unique identifier',
  })
  @ApiNoContentResponse({
    description: 'Operator was removed successfully',
  })
  @ApiBadRequestResponse({
    description:
      'Operator id is not valid uuid v4, has flights assigned or has aircraft assigned',
    type: GenericBadRequestResponse,
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
    description: 'Operator with given it does not exist',
    type: GenericNotFoundResponse,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(UserRole.Operations)
  remove(@UuidParam('id') id: string): Promise<void> {
    return this.operatorsService.remove(id);
  }
}
